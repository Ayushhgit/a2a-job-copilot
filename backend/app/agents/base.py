from abc import ABC, abstractmethod
import json
from pydantic import ValidationError
from app.models.message import A2AMessage, AgentDecision
from app.core.event_bus import event_bus
from app.core.llm import llm_client
from app.core.logger import logger
from app.tools.implementations import TOOLS_MAP

class BaseAgent(ABC):
    def __init__(self, name: str, instruction: str):
        self.name = name
        self.instruction = instruction
        event_bus.subscribe(self.name, self.receive_message)

    async def receive_message(self, message: A2AMessage):
        try:
            logger.info(f"{self.name} received message from {message.sender}")
            turns = message.context.get("turns_taken", 0)
            max_turns = message.context.get("max_turns", 15)
            
            if turns >= max_turns:
                logger.error(f"{self.name} circuit breaker triggered. Limit reached.")
                await self.send_message(
                    receiver="Router",
                    msg_type="result",
                    payload={"result": "FAILED: Max turns exceeded."},
                    context=message.context
                )
                return

            message.context["turns_taken"] = turns + 1
            await self._log(f"Processing turn {message.context['turns_taken']}/{max_turns}", context=message.context)
            
            await self.process(message)
        except Exception as e:
            logger.exception(f"{self.name} failed to process message: {e}")
            await self._log(f"Error processing message: {e}", context=message.context)
            await self.send_message(
                receiver="Router",
                msg_type="result",
                payload={"result": f"FAILED: Internal agent error {str(e)}"},
                context=message.context
            )

    async def process(self, message: A2AMessage):
        prompt = f"Message received: {json.dumps(message.payload)}\nInstruction: {self.instruction}"
        
        try:
            decision_data = await self.decide_next_action(prompt)
            decision = AgentDecision(**decision_data)
        except ValidationError as e:
            logger.error(f"LLM produced invalid decision schema: {e}")
            await self._log("LLM schema validation failed, falling back to Router", context=message.context)
            decision = AgentDecision(next_action="route", target_agent="Router", reasoning="LLM parsing failure.")

        await self._log(f"Decision: {decision.next_action}. Reason: {decision.reasoning}", context=message.context)
        
        if decision.next_action == "route":
            target = decision.target_agent if decision.target_agent else "Router"
            await self.send_message(
                receiver=target,
                msg_type="task",
                payload={"instruction": "Continue processing.", "original": message.payload},
                context=message.context
            )
        elif decision.next_action == "use_tool":
            if decision.tool_name in TOOLS_MAP:
                tool = TOOLS_MAP[decision.tool_name]
                try:
                    valid_args = tool.args_schema(**(decision.tool_args or {}))
                    await self._log(f"Executing tool {decision.tool_name}...", context=message.context)
                    result = await tool.execute(**valid_args.dict())
                except ValidationError as e:
                    logger.error(f"Tool param validation error: {e}")
                    result = f"Tool execution failed due to invalid schema: {e}"
                except Exception as e:
                    logger.exception(f"Tool execution internal error: {e}")
                    result = f"Tool execution crashed: {e}"
                    
                await self._log(f"Tool result: {str(result)[:100]}...", context=message.context)
                
                await self.send_message(
                    receiver="Router",
                    msg_type="tool_result",
                    payload={"result": result, "original": message.payload},
                    context=message.context
                )
            else:
                await self._log(f"Unknown tool requested: {decision.tool_name}", context=message.context)
                await self.send_message(
                     receiver="Router",
                     msg_type="tool_result",
                     payload={"error": f"Tool {decision.tool_name} missing"},
                     context=message.context
                )
        else:
             await self.send_message(
                receiver="Router", 
                msg_type="result",
                payload={"result": decision.result or "Completed step."},
                context=message.context
            )
             
    async def decide_next_action(self, prompt: str) -> dict:
        system_prompt = f"""You are {self.name}. 
        {self.instruction}
        Available actions: "route", "use_tool", "respond", "complete".
        If "route", "target_agent" must be one of: Router, Planner, Researcher, Executor.
        If "use_tool", "tool_name" must be one of: {list(TOOLS_MAP.keys())} and "tool_args" must be a dict.
        Output exact JSON."""
        return await llm_client.generate_json(system_prompt, prompt)

    async def send_message(self, receiver: str, msg_type: str, payload: dict, context: dict):
        msg = A2AMessage(
            sender=self.name,
            receiver=receiver,
            type=msg_type,
            payload=payload,
            context=context
        )
        await event_bus.publish(A2AMessage(
            sender="System",
            receiver="Frontend",
            type="edge",
            payload={"source": self.name, "target": receiver, "type": msg_type},
            context=context
        ))
        await event_bus.publish(msg)
        
    async def _log(self, text: str, context: dict):
        log_msg = A2AMessage(
            sender=self.name,
            receiver="Frontend",
            type="log",
            payload={"text": text},
            context=context
        )
        await event_bus.publish(log_msg)

from app.core.llm import llm_client
from app.core.event_bus import event_bus
from app.models.message import A2AMessage, AgentDecision
from app.core.logger import logger
from pydantic import ValidationError
import json

class LLMRouter:
    def __init__(self):
        self.name = "Router"
        event_bus.subscribe(self.name, self.route_message)

    async def route_message(self, message: A2AMessage):
        logger.info(f"Router received message type: {message.type} from {message.sender}")
        
        if message.type == "result" and message.sender in ["Optimizer", "System", "ResumeGenerator"]:
            await event_bus.publish(A2AMessage(
                sender=self.name, receiver="Frontend", type="log",
                payload={"text": "Final LaTeX generation complete!"}, context=message.context
            ))
            await event_bus.publish(A2AMessage(
                sender=self.name, receiver="Frontend", type="task_complete",
                payload={"result": message.payload.get("result", str(message.payload))}, context=message.context
            ))
            return

        if message.type == "tool_result":
            await event_bus.publish(A2AMessage(
                sender=self.name, receiver="Frontend", type="log",
                payload={"text": "Routing Tool Result back to specific Agent."}, context=message.context
            ))
            original_sender = message.payload.get("original", {}).get("sender", "Optimizer")
            await self._dispatch(message, original_sender, "Tool output returned")
            return

        system_prompt = """You are the intelligent Copilot Router. 
        Route traffic through the resume generation pipeline:
        1. JDAnalyzer (Extract keywords)
        2. Matcher (Vector search & scoring)
        3. ResumeGenerator (JSON construction)
        4. Optimizer (Optimization & final LaTeX generation)
        Determine the next best Agent based on the message. Output JSON: { "target_agent": "AgentName", "reasoning": "why" }."""
        
        user_prompt = f"Message payload: {json.dumps(message.payload)[:1000]} from {message.sender}. Type: {message.type}"
        
        try:
            decision_data = await llm_client.generate_json(system_prompt, user_prompt)
            decision = AgentDecision(next_action="route", target_agent=decision_data.get("target_agent", "JDAnalyzer"), reasoning=decision_data.get("reasoning", ""))
        except Exception as e:
            logger.error(f"Router LLM evaluation failed: {e}")
            decision = AgentDecision(next_action="route", target_agent="JDAnalyzer", reasoning="Fallback routing.")
            
        await event_bus.publish(A2AMessage(
            sender=self.name, receiver="Frontend", type="log",
            payload={"text": f"Logical Route to {decision.target_agent}. Reason: {decision.reasoning}"}, context=message.context
        ))
        
        await self._dispatch(message, decision.target_agent or "JDAnalyzer", decision.reasoning)
        
    async def _dispatch(self, original_msg: A2AMessage, target: str, reason: str):
         await event_bus.publish(A2AMessage(
            sender=self.name, receiver="Frontend", type="edge",
            payload={"source": original_msg.sender, "target": target, "type": "route"}, context=original_msg.context
        ))
         
         # Carry sender forward so tools return to the caller
         payload = original_msg.payload.copy()
         payload["sender"] = original_msg.sender
         
         new_msg = A2AMessage(
            sender=self.name,
            receiver=target,
            type="task",
            payload=payload,
            context=original_msg.context
        )
         await event_bus.publish(new_msg)

router = LLMRouter()

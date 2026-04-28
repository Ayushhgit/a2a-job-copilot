from app.core.event_bus import event_bus
from app.models.message import A2AMessage
from app.core.logger import logger

class LLMRouter:
    def __init__(self):
        self.name = "Router"
        event_bus.subscribe(self.name, self.route_message)

    async def route_message(self, message: A2AMessage):
        logger.info(f"Router received message type: {message.type} from {message.sender}")
        
        if message.type == "result" and message.sender == "ResumeGenerator":
            resume_json = message.payload.get("result", "")
            await event_bus.publish(A2AMessage(
                sender=self.name, receiver="Frontend", type="log",
                payload={"text": "Routing ResumeGenerator output → Optimizer."}, context=message.context
            ))
            await self._dispatch(message, "Optimizer", "Resume JSON constructed, optimizing.")
            return

        if message.type == "result" and message.sender in ["Optimizer", "System"]:
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
            # Determine next agent based on who produced the tool result.
            # Matcher's job is done after VectorSearch — hand off to ResumeGenerator.
            # All others return to themselves to process their own tool output.
            TOOL_RESULT_NEXT: dict = {
                "Matcher": "ResumeGenerator",
            }
            next_agent = TOOL_RESULT_NEXT.get(message.sender, message.sender)
            await event_bus.publish(A2AMessage(
                sender=self.name, receiver="Frontend", type="log",
                payload={"text": f"Routing Tool Result → {next_agent}."}, context=message.context
            ))
            await self._dispatch(message, next_agent, "Tool output returned")
            return

        PIPELINE_NEXT = {
            "JDAnalyzer": "Matcher",
            "Matcher": "ResumeGenerator",
            "ResumeGenerator": "Optimizer",
            "System": "JDAnalyzer",
        }
        target = PIPELINE_NEXT.get(message.sender, "JDAnalyzer")
        await event_bus.publish(A2AMessage(
            sender=self.name, receiver="Frontend", type="log",
            payload={"text": f"Route {message.sender} → {target}."}, context=message.context
        ))
        await self._dispatch(message, target, f"{message.sender} complete.")
        
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

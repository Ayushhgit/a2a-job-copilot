import asyncio
from typing import Callable, Dict, List, Any
from app.models.message import A2AMessage
from app.core.logger import logger

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[A2AMessage], Any]]] = {}
        self._queue: asyncio.Queue = asyncio.Queue()
        self._sse_queue: asyncio.Queue = asyncio.Queue()
        self._dlq: asyncio.Queue = asyncio.Queue()
        self.active_session_id: str | None = None
    
    def subscribe(self, agent_name: str, callback: Callable[[A2AMessage], Any]):
        if agent_name not in self._subscribers:
            self._subscribers[agent_name] = []
        self._subscribers[agent_name].append(callback)
    
    async def publish(self, message: A2AMessage):
        await self._queue.put(message)
    
    async def _dispatch_loop(self):
        while True:
            message: A2AMessage = await self._queue.get()
            
            await self._sse_queue.put(message)

            receiver = message.receiver
            if receiver in self._subscribers:
                for callback in self._subscribers[receiver]:
                    asyncio.create_task(self._safe_call(callback, message))
            else:
                if receiver not in ["Frontend", "System"]:
                    logger.warning(f"No subscriber found for {receiver}. Message moved to DLQ.")
                    await self._dlq.put(message)

            self._queue.task_done()
            
    async def _safe_call(self, callback, message):
        try:
            if asyncio.iscoroutinefunction(callback):
                await callback(message)
            else:
                callback(message)
        except Exception as e:
            logger.exception(f"Error in subscriber callback for message {message.id}: {e}")
            await self._dlq.put(message)

    async def get_sse_message(self) -> A2AMessage:
        msg: A2AMessage = await self._sse_queue.get()
        return msg

event_bus = EventBus()

async def start_event_bus():
    asyncio.create_task(event_bus._dispatch_loop())

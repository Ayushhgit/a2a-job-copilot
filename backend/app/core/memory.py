from typing import Dict, Any, List
from threading import Lock
from app.core.logger import logger

class SessionMemory:
    def __init__(self):
        self._memory: Dict[str, Any] = {}
        self._histories: Dict[str, List[Dict[str, Any]]] = {}
        self._lock = Lock()

    def set(self, key: str, value: Any):
        with self._lock:
            self._memory[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        with self._lock:
            return self._memory.get(key, default)
            
    def append_history(self, session_id: str, entry: Dict[str, Any]):
        with self._lock:
            if session_id not in self._histories:
                self._histories[session_id] = []
            self._histories[session_id].append(entry)
            self._prune_history(session_id)
            
    def get_history(self, session_id: str) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self._histories.get(session_id, []))
            
    def _prune_history(self, session_id: str):
        history = self._histories[session_id]
        if len(history) > 20: 
            logger.info(f"Pruning session history for {session_id}")
            self._histories[session_id] = history[:2] + history[-18:]

shared_memory = SessionMemory()

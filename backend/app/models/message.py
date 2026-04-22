from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

def _get_utc_now():
    return datetime.now(timezone.utc)

class A2AMessage(BaseModel):
    """Base message interface for all A2A communications"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender: str
    receiver: str
    type: str  # task, result, log, edge, query, etc.
    payload: Dict[str, Any]
    context: Dict[str, Any] = Field(default_factory=dict) # Carries session_id, max_turns, turns_taken
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=_get_utc_now)

class AgentDecision(BaseModel):
    """Strict schema for Agent routing and reasoning"""
    next_action: str = Field(pattern="^(route|use_tool|respond|complete)$")
    target_agent: Optional[str] = None
    reasoning: str
    tool_name: Optional[str] = None
    tool_args: Optional[Dict[str, Any]] = None
    result: Optional[str] = None

class ContextControl(BaseModel):
    session_id: str
    max_turns: int = 15
    turns_taken: int = 0

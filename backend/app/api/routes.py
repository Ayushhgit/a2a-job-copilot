from fastapi import APIRouter, Request, HTTPException
from sse_starlette.sse import EventSourceResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.message import A2AMessage, ContextControl
from app.models.resume import UserProfile
from app.core.user_store import user_store
from app.core.vector_store import vector_store
from app.core.event_bus import event_bus
from app.core.logger import logger
from pydantic import BaseModel
import uuid
import json
import asyncio

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

class GenerateRequest(BaseModel):
    user_id: str
    job_description: str

@router.post("/profile")
@limiter.limit("5/minute")
async def save_profile(request: Request, profile: UserProfile):
    user_store.save_user(profile)
    vector_store.load_user(profile)
    return {"message": f"Profile {profile.id} saved and vector embeddings loaded."}

@router.post("/generate_resume")
@limiter.limit("10/minute")
async def generate_resume(request: Request, req: GenerateRequest):
    profile = user_store.get_user(req.user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User Profile not found.")

    if vector_store._current_id == 0:
        vector_store.load_user(profile)

    session_id = str(uuid.uuid4())
    context_control = ContextControl(session_id=session_id)
    
    payload = {
        "job_description": req.job_description,
        "profile_meta": {
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "linkedin": profile.linkedin,
            "skills": profile.skills,
            "education": [e.dict() for e in profile.education],
        }
    }
    
    msg = A2AMessage(
        sender="System",
        receiver="JDAnalyzer",
        type="task",
        payload=payload,
        context=context_control.dict()
    )
    
    logger.info(f"Resume Generation Task submitted for {req.user_id}")
    await event_bus.publish(A2AMessage(
        sender="System", receiver="Frontend", type="log",
        payload={"text": f"Pipeline started for {req.user_id} Job Analysis"}, context=msg.context
    ))
    
    await event_bus.publish(A2AMessage(
        sender="System", receiver="Frontend", type="edge",
        payload={"source": "System", "target": "JDAnalyzer", "type": "task"}, context=msg.context
    ))
    
    await event_bus.publish(msg)
    
    return {"message": "Job matched, generating layout.", "session_id": session_id}

@router.get("/events")
async def sse_events(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                logger.info("SSE Client disconnected.")
                break
                
            msg: A2AMessage = await event_bus.get_sse_message()
            if msg.receiver == "Frontend":
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "id": msg.id,
                        "type": msg.type,
                        "timestamp": msg.timestamp.isoformat(),
                        "payload": msg.payload,
                        "sender": msg.sender
                    })
                }
    return EventSourceResponse(event_generator())

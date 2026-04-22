from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api.routes import router as api_router
from app.api.routes import limiter
from app.core.event_bus import start_event_bus
from app.core.logger import logger

app = FastAPI(title="AI Job Copilot System")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Copilot System...")
    # Import ensures they are registered
    from app.agents.implementations import jd_analyzer, matcher, resume_generator, optimizer
    from app.engine.router import router
    await start_event_bus()
    logger.info("Copilot backend started and event bus is running.")

import sys
from loguru import logger

logger.remove()

logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    enqueue=True,
    colorize=True,
)

logger.add(
    "logs/a2a_{time:YYYY-MM-DD}.log",
    rotation="10 MB",
    retention="10 days",
    enqueue=True,
    level="DEBUG",
)

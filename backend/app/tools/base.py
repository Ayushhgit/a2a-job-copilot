from pydantic import BaseModel
from abc import ABC, abstractmethod
from typing import Dict, Any, Type

class BaseTool(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    @property
    @abstractmethod
    def args_schema(self) -> Type[BaseModel]:
        pass

    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        pass

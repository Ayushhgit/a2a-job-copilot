from app.tools.base import BaseTool
from app.core.vector_store import vector_store
from app.core.logger import logger
from typing import Dict, Any, Type
import json
from pydantic import BaseModel, Field

class VectorSearchArgs(BaseModel):
    query: str = Field(..., description="The skill or requirement to search for. E.g. 'React frontend state management'")

class VectorSearchTool(BaseTool):
    @property
    def name(self) -> str:
        return "VectorSearchTool"
    @property
    def description(self) -> str:
        return "Searches the user's vector embeddings for most relevant projects/experience. Input a semantic query describing the target skill."
    @property
    def args_schema(self) -> Type[BaseModel]:
        return VectorSearchArgs

    async def execute(self, query: str = "", **kwargs) -> Any:
        try:
            res = vector_store.search(query, top_k=3)
            return json.dumps(res, default=str)
        except Exception as e:
            logger.exception("VectorSearchTool failed")
            return f"Error searching vector store: {e}"

class CompileLatexArgs(BaseModel):
    resume_json: Dict[str, Any] = Field(..., description="The structured ResumeData JSON.")

class CompileLatexTool(BaseTool):
    @property
    def name(self) -> str:
        return "CompileLatexTool"
    @property
    def description(self) -> str:
        return "Compiles JSON Resume payload into formatted raw LaTeX. You MUST pass the complete ResumeData object."
    @property
    def args_schema(self) -> Type[BaseModel]:
        return CompileLatexArgs

    async def execute(self, resume_json: dict = None, **kwargs) -> Any:
        from app.engine.latex_builder import latex_builder
        from app.models.resume import ResumeData
        try:
            rdata = ResumeData(**resume_json)
            out = latex_builder.build_resume(rdata)
            return out
        except Exception as e:
            return f"Error compiling LaTeX: {e}"

_tools = [VectorSearchTool(), CompileLatexTool()]
TOOLS_MAP = {t.name: t for t in _tools}

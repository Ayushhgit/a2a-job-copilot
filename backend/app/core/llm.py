import httpx
from app.core.config import settings
from app.core.logger import logger
import json
from typing import Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

class GroqLLM:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.base_url = settings.groq_base_url
        self.model = settings.groq_model

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8),
        retry=retry_if_exception_type((httpx.HTTPError, json.JSONDecodeError, ValueError))
    )
    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Strictly generates JSON output from LLM, with exponential backoff on failure."""
        res = await self.generate(system_prompt, user_prompt, response_format="json_object")
        try:
            if res.startswith("```"):
                res = "\n".join(res.split("\n")[1:-1])
            parsed = json.loads(res.strip())
            return parsed
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {res} | Error: {e}")
            raise ValueError(f"Invalid JSON response: {res}") from e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8),
        retry=retry_if_exception_type(httpx.HTTPError)
    )
    async def generate(self, system_prompt: str, user_prompt: str, response_format: str = "text") -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2
        }
        if response_format == "json_object":
            payload["response_format"] = {"type": "json_object"}

        if self.api_key == "dummy_key_by_default":
            return self._mock_response(system_prompt, user_prompt, response_format)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.HTTPError as e:
            logger.error(f"LLM HTTP Error: {e}")
            raise 

    def _mock_response(self, system_prompt: str, user_prompt: str, response_format: str) -> str:
        logger.debug(f"[MOCK LLM] System: {system_prompt[:50]}... User: {user_prompt[:50]}...")
        if "router" in system_prompt.lower() or response_format == "json_object":
            if "research" in user_prompt.lower():
                return json.dumps({"next_action": "route", "target_agent": "Researcher", "reasoning": "Mock: Need research."})
            elif "plan" in user_prompt.lower() or "break" in user_prompt.lower():
                return json.dumps({"next_action": "route", "target_agent": "Planner", "reasoning": "Mock: Need a plan."})
            elif "tool" in system_prompt.lower():
                return json.dumps({"next_action": "use_tool", "tool_name": "WebSearchTool", "tool_args": {"query": user_prompt}, "reasoning": "Mock tool call"})
            else:
                return json.dumps({"next_action": "route", "target_agent": "Executor", "reasoning": "Mock: Executing."})
        return "This is a mocked response since valid Groq API key was not provided."

llm_client = GroqLLM()

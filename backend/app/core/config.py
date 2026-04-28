from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "A2A Protocol System"
    groq_api_key: str = "dummy_key_by_default"
    groq_model: str = "gemma2-9b-it"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    class Config:
        env_file = ".env"

settings = Settings()

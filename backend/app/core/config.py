from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ANTHROPIC_API_KEY: str
    AI_MODEL: str = "claude-sonnet-4-6"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://aria.app"]

    class Config:
        env_file = ".env"


settings = Settings()

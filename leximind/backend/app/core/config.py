"""
core/config.py
Application settings loaded from environment variables.
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Gemini ───────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── Server ───────────────────────────────────────────────────────────────
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = False

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # ── Upload limits ─────────────────────────────────────────────────────────
    MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10 MB

    # ── Model paths ───────────────────────────────────────────────────────────
    # Relative to backend root, or absolute.
    # Files are auto-downloaded from Hugging Face if not present.
    MODELS_DIR: str = "models"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()

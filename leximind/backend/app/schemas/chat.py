"""
schemas/chat.py
Pydantic request / response models for the chat endpoint.
"""
from pydantic import BaseModel, Field


class ContextChunk(BaseModel):
    case: str
    preview: str
    full_text: str
    score: float = 0.0
    rank: int = 1


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    context: list[ContextChunk] = []


class ChatResponse(BaseModel):
    success: bool
    response: str | None = None
    sources: list[str] = []
    error: str | None = None

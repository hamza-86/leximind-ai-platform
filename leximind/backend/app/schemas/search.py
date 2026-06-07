"""
schemas/search.py
Pydantic request / response models for the analyze endpoint.
"""
from pydantic import BaseModel, Field


class SearchResult(BaseModel):
    case: str
    score: float
    rank: int
    preview: str
    full_text: str


class AnalyzeRequest(BaseModel):
    """Used when sending text as JSON (the /api/v1/analyze/text variant)."""
    text_input: str = Field(..., min_length=1)


class AnalyzeResponse(BaseModel):
    category: str
    results: list[SearchResult]
    original_document: str | None = None

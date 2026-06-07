"""
services/search_service.py
Semantic search + category prediction — exact port of the POST / logic from app.py.
"""
import gc

import numpy as np


from app.services.model_loader import (
    get_case_names,
    get_embeddings,
    get_model,
    get_modellog,
    get_judgment_texts,
)
from app.schemas.search import SearchResult


def analyze_judgment(input_text: str) -> tuple[str, list[SearchResult], str | None]:
    """
    Run category prediction + semantic search on input text.

    Returns:
        predicted_category  – string label from modellog
        results             – list of SearchResult (top 5)
        original_document   – the cleaned text (after JUDGMENT offset), kept for chatbot

    Raises:
        ValueError on short / empty input
        RuntimeError on model errors
    """
    # ── Minimum word count (original: 5 words) ─────────────────────────────
    word_count = len(input_text.strip().split())
    if word_count < 5:
        raise ValueError(
            f"Input text is too short. Please provide at least 5 words for meaningful analysis. "
            f"Current: {word_count} words."
        )

    # ── Trim to JUDGMENT section (original behaviour) ──────────────────────
    start_index = input_text.find("JUDGMENT")
    text = input_text[start_index:] if start_index != -1 else input_text

    # ── Load models (lazy) ─────────────────────────────────────────────────
    try:
        modellog = get_modellog()
        model = get_model()
        case_names = get_case_names()
        embeddings = get_embeddings()
        judgment_texts = get_judgment_texts()
    except Exception as exc:
        raise RuntimeError(f"Error loading ML models: {exc}") from exc

    # ── Category prediction ────────────────────────────────────────────────
    try:
        predicted_category: str = modellog.predict([text])[0]
    except Exception as exc:
        raise RuntimeError(f"Error in category prediction: {exc}") from exc

    # ── Semantic search — top 5 ────────────────────────────────────────────
    try:
        from sentence_transformers import util
        query_embedding = model.encode(text, convert_to_tensor=True)
        cos_scores = util.cos_sim(query_embedding, embeddings)[0]
        top_results = np.argsort(-cos_scores)[:5]
    except Exception as exc:
        raise RuntimeError(f"Error in semantic search: {exc}") from exc

    results: list[SearchResult] = []
    for rank, idx in enumerate(top_results, start=1):
        results.append(
            SearchResult(
                case=case_names[idx],
                score=float(cos_scores[idx]),
                rank=rank,
                preview=judgment_texts[idx][:500],
                full_text=judgment_texts[idx],
            )
        )

    original_document: str = text

    # ── PRIVACY: clean up large in-memory objects ASAP ────────────────────
    try:
        del input_text
        del text
        gc.collect()
    except Exception:
        pass

    return predicted_category, results, original_document

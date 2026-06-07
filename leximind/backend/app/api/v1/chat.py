"""
api/v1/chat.py
/api/v1/chat  – RAG chatbot endpoint.
Preserves all original Flask /chat route behaviour from app.py.
"""
from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import get_legal_explanation

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    """
    Receive a user question + optional context chunks, return an AI answer.
    Exact port of Flask /chat route.
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty",
        )

    context_chunks = [chunk.model_dump() for chunk in payload.context]

    # ── No context — greeting / general question branch ───────────────────
    if not context_chunks:
        if question.lower().strip() in {"hi", "hello", "hey", "help", "what can you do"}:
            return ChatResponse(
                success=True,
                response=(
                    "Hello! I'm your legal assistant. I can help explain your uploaded legal "
                    "documents in simple, everyday language with clear, structured responses "
                    "using emojis and sections. Please upload a document first using the main "
                    "form, then ask me specific questions about it. For example: "
                    "'What does this mean?', 'Explain this in simple words', "
                    "'Give me a structured summary', or "
                    "'Explain this like I'm not a law student.'"
                ),
            )
        return ChatResponse(
            success=True,
            response=(
                "I can help explain legal concepts in simple terms with clear, structured "
                "responses using emojis and sections, but I need some context from your "
                "uploaded document to provide accurate information. Please upload a document "
                "first using the main form, then ask me specific questions about it. "
                "Try: 'Give me a structured summary' or "
                "'Explain this in simple terms like I'm not a law student.'"
            ),
        )

    # ── Call Gemini ───────────────────────────────────────────────────────
    result = get_legal_explanation(question, context_chunks)

    if result.get("error"):
        return ChatResponse(success=False, error=result["error"])

    return ChatResponse(
        success=True,
        response=result["answer"],
        sources=result.get("sources", []),
    )

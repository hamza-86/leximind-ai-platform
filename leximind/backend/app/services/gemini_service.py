"""
services/gemini_service.py
Initialises Gemini AI and provides get_legal_explanation().
Preserves 100% of the original logic from app.py.
"""
import os
import threading

import google.generativeai as genai

from app.core.config import get_settings

_lock = threading.Lock()
_gemini_initialized = False
_gemini_model = None


def initialize_gemini():
    """Initialize Gemini AI — thread-safe, idempotent."""
    global _gemini_initialized, _gemini_model

    with _lock:
        if _gemini_initialized:
            return _gemini_model is not None

        settings = get_settings()
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            print("[WARNING] GEMINI_API_KEY not found in environment variables")
            _gemini_initialized = True
            return False

        try:
            genai.configure(api_key=api_key)
            print(f"[INFO] Attempting to initialize Gemini AI with key: {api_key[:10]}…")
            _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
            print("[INFO] Gemini AI model created successfully")
            _gemini_initialized = True
            return True
        except Exception as exc:
            print(f"[WARNING] Failed to initialize Gemini model: {exc}")
            _gemini_initialized = True
            return False


def get_gemini_model():
    if not _gemini_initialized:
        initialize_gemini()
    return _gemini_model


# ── Core RAG explanation logic (copied verbatim from app.py) ─────────────────

def get_legal_explanation(question: str, context_chunks: list, max_retries: int = 3) -> dict:
    """
    Get legal explanation from Gemini AI using retrieved context.
    Exact port of app.py::get_legal_explanation().
    """
    gemini_model = get_gemini_model()
    if not gemini_model:
        return {
            "error": (
                "❌ AI service temporarily unavailable due to quota limits. "
                "Please try again later or use the search functionality to find relevant legal cases."
            ),
            "answer": None,
            "sources": [],
        }

    if not context_chunks:
        return {
            "error": None,
            "answer": (
                "I can help explain legal concepts in simple terms, but I need some context "
                "from legal cases to provide accurate information. Please use the main search "
                "form first to find relevant cases, then ask me specific questions about them."
            ),
            "sources": [],
        }

    context = "\n\n".join([
        f"[Source: {chunk.get('case', 'Unknown Case')}] "
        f"{chunk.get('full_text', chunk.get('preview', ''))[:1000]}"
        for chunk in context_chunks
    ])

    question_lower = question.lower()

    wants_structured = any(k in question_lower for k in [
        "structured summary", "summary with sections", "give a structured summary",
        "case background", "high court", "supreme court", "why it matters",
    ])
    wants_layman = any(k in question_lower for k in [
        "explain in simple terms", "layman", "non-law student", "simple words",
        "easy explanation", "plain english", "everyday language",
    ])

    if wants_structured:
        system_prompt = """You are a senior legal professional and expert in Indian law.
        Your task is to provide a structured summary of this PDF judgment that DIRECTLY ANSWERS the user's specific question.

        CRITICAL: Focus on answering what the user specifically asked about, not giving a generic summary.

        STRUCTURE YOUR RESPONSE BASED ON THE USER'S QUESTION:
        📌 Case background (only if relevant to their question)
        📌 Issue (main legal question they asked about)
        📌 High Court's decision (only if they asked about it)
        📌 Supreme Court's decision (only if they asked about it)
        📌 Why it matters (impact) (only if they asked about it)

        IMPORTANT RULES:
        1. Use only the provided context - do not add external knowledge
        2. If details are missing, say: "I couldn't find that information in the provided documents."
        3. Cite sources using [Case Name] format
        4. Simplify legal terms into everyday language
        5. Keep it professional, accurate, and complete
        6. Use emojis and clear formatting for better readability
        7. Structure with bullet points and short paragraphs
        8. Answer ONLY what they specifically asked about

        CONTEXT:
        {context}

        USER'S SPECIFIC QUESTION: {question}

        INSTRUCTIONS:
        - Read their question carefully
        - Only include sections that are relevant to their question
        - If they ask about legal sections, focus on those sections
        - If they ask for explanation of specific text, explain that text
        - Do not give generic summaries unless that's what they asked for

        Please provide a structured answer to their specific question:"""

    elif wants_layman:
        system_prompt = """You are a senior legal professional and expert in Indian law.
        Your task is to explain this PDF judgment in simple terms, as if explaining to a non-law student.

        CRITICAL: Focus on answering what the user specifically asked about, not giving a generic summary.

        STRUCTURE YOUR RESPONSE BASED ON THE USER'S QUESTION:
        📌 What the case was about (facts + background) - only if relevant to their question
        📌 What the High Court said - only if they asked about it
        📌 What the Supreme Court corrected - only if they asked about it
        📌 Why it matters (impact) - only if they asked about it

        IMPORTANT RULES:
        1. Use only the provided context - do not add external knowledge
        2. If something is not in the document, say: "I couldn't find that information in the provided documents."
        3. Cite sources using [Case Name] format
        4. Break down legal terms into plain words
        5. Keep it short, clear, professional, and complete
        6. Use emojis and clear formatting for better readability
        7. Structure with bullet points and short paragraphs
        8. Answer ONLY what they specifically asked about

        CONTEXT:
        {context}

        USER'S SPECIFIC QUESTION: {question}

        INSTRUCTIONS:
        - Read their question carefully
        - Only include sections that are relevant to their question
        - If they ask about legal sections, focus on those sections
        - If they ask for explanation of specific text, explain that text
        - Do not give generic summaries unless that's what they asked for

        Please provide a simple explanation that directly answers their specific question:"""

    else:
        system_prompt = """You are a senior legal professional and expert in Indian law.
        Your task is to ANSWER THE USER'S SPECIFIC QUESTION about the provided legal document in very simple, everyday words that even a 10th grader can understand.

        CRITICAL: You must directly address the user's specific question, not give a generic summary.

        IMPORTANT RULES:
        1. Always use only the provided context - do not add external knowledge
        2. If the answer is not in the context, say "I couldn't find that information in the provided documents."
        3. Always cite your sources using [Case Name] format
        4. Explain complex legal terms in simple words
        5. Be helpful, professional, and accurate
        6. Keep explanations concise but complete
        7. Structure your response with clear sections using emojis (📌, 👉, etc.) for better readability
        8. Use bullet points and short paragraphs for easy reading
        9. Make the response visually organized and scannable
        10. Focus on answering the EXACT question asked

        CONTEXT:
        {context}

        USER'S SPECIFIC QUESTION: {question}

        INSTRUCTIONS:
        - Read the user's question carefully
        - Answer ONLY what they asked about
        - If they ask about legal sections, explain those specific sections
        - If they ask for explanation of text, explain that specific text
        - Do not give generic case summaries unless specifically asked
        - Structure your answer to directly address their question

        Please provide a clear, structured answer to the user's specific question:"""

    prompt = system_prompt.format(context=context, question=question)

    for attempt in range(max_retries):
        try:
            response = gemini_model.generate_content(prompt)
            if response and response.text:
                sources = [
                    chunk.get("case", "Unknown Case")
                    for chunk in context_chunks
                    if chunk.get("case")
                ]
                return {"answer": response.text.strip(), "sources": sources, "error": None}
            return {"error": "No response generated from AI model", "answer": None, "sources": []}
        except Exception as exc:
            error_str = str(exc)
            if attempt == max_retries - 1:
                if "quota" in error_str.lower() or "429" in error_str:
                    return {
                        "error": (
                            "❌ QUOTA EXCEEDED: Your Gemini API free tier limit has been reached. "
                            "Please upgrade to a paid plan or wait for the quota to reset. "
                            "See: https://ai.google.dev/pricing"
                        ),
                        "answer": None,
                        "sources": [],
                    }
                elif "api_key" in error_str.lower() or "permission" in error_str.lower():
                    return {
                        "error": (
                            "❌ API KEY ISSUE: Please check your Gemini API key in the .env file. "
                            "Make sure it's valid and has the required permissions."
                        ),
                        "answer": None,
                        "sources": [],
                    }
                return {
                    "error": f"❌ AI service error after {max_retries} attempts: {error_str}",
                    "answer": None,
                    "sources": [],
                }
            continue

    return {"error": "Failed to get response from AI service", "answer": None, "sources": []}

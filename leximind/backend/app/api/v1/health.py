"""
api/v1/health.py
/api/v1/health — health check endpoint, same logic as Flask /health.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.model_loader import is_loaded
from app.services.gemini_service import get_gemini_model

router = APIRouter()


@router.get("/health")
async def health():
    """Health check — reports model load state without triggering loading."""
    return JSONResponse({
        "status": "healthy",
        "models_loaded": is_loaded(),
        "gemini_ready": get_gemini_model() is not None,
        "message": "App is running. ML models load on-demand.",
    })


@router.get("/test-api")
async def test_api():
    """Test Gemini API key, same as Flask /test-api."""
    from app.core.config import get_settings
    settings = get_settings()
    api_key = settings.GEMINI_API_KEY
    gemini_model = get_gemini_model()

    if not gemini_model:
        return JSONResponse({
            "success": False,
            "error": "Gemini model not initialized",
            "api_key_set": bool(api_key),
            "api_key_preview": (api_key[:10] + "...") if api_key else None,
        })

    try:
        response = gemini_model.generate_content("Hello, can you respond with 'API test successful'?")
        if response and response.text:
            return JSONResponse({
                "success": True,
                "message": "API test successful",
                "response": response.text.strip(),
            })
        return JSONResponse({"success": False, "error": "No response from API"})
    except Exception as exc:
        return JSONResponse({"success": False, "error": str(exc)})

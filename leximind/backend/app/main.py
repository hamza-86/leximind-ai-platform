import os
import sys

# Dynamically add backend folder to sys.path to prevent module resolution conflicts when running from root
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.services.gemini_service import initialize_gemini


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # Pre-initialise Gemini (models load lazily on first request)
    initialize_gemini()
    yield


settings = get_settings()

app = FastAPI(
    title="LexiMind API",
    description="AI-powered legal judgment analysis and case similarity search",
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Root ─────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "LexiMind API is running", "docs": "/docs"}

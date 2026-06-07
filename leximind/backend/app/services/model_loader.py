"""
services/model_loader.py
Singleton, lazy-loading model loader.

Priority order for model files:
  1. LOCAL models/ directory (fastest — already cached)
  2. Workspace root legacy location (backward compat during dev)
  3. Auto-download from Hugging Face via model_downloader.py

Preserves 100% of the original load_models() logic from app.py.
"""
import os
import threading
import joblib

from app.core.config import get_settings
from app.core.model_downloader import ensure_models

_lock = threading.Lock()
_loaded = False
_judgment_texts = None
_model = None
_case_names = None
_embeddings = None
_modellog = None


def _get_models_dir() -> str:
    """
    Resolve the absolute path to the models directory.

    Priority:
      1. MODELS_DIR env var (if absolute)
      2. MODELS_DIR relative to backend root
      3. Workspace root (legacy location during local dev)
    """
    settings = get_settings()
    base = settings.MODELS_DIR

    if os.path.isabs(base):
        return base

    # backend root = leximind/backend/  (2 levels up from this file's package)
    backend_root = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    configured_dir = os.path.join(backend_root, base)

    # workspace root = parent of leximind/
    workspace_root = os.path.dirname(os.path.dirname(backend_root))

    # If any pkl file exists in the workspace root (legacy), use that folder
    legacy_check = os.path.join(workspace_root, "model.pkl")
    if os.path.exists(legacy_check):
        return workspace_root

    return configured_dir


def load_models() -> None:
    """Load all ML pickle files. Thread-safe, idempotent."""
    global _loaded, _judgment_texts, _model, _case_names, _embeddings, _modellog

    with _lock:
        if _loaded:
            return

        models_dir = _get_models_dir()
        print(f"[INFO] Models directory: {models_dir}", flush=True)

        # Auto-download any missing files from Hugging Face
        ensure_models(models_dir)

        print("[INFO] Loading ML models…", flush=True)

        _judgment_texts = joblib.load(os.path.join(models_dir, "judgment_texts.pkl"))
        _model          = joblib.load(os.path.join(models_dir, "model.pkl"))
        _case_names     = joblib.load(os.path.join(models_dir, "case_names.pkl"))
        _embeddings     = joblib.load(os.path.join(models_dir, "embeddings.pkl"))
        _modellog       = joblib.load(os.path.join(models_dir, "modellog.pkl"))

        _loaded = True
        print("[INFO] ✓ All ML models loaded successfully", flush=True)


def is_loaded() -> bool:
    return _loaded


# ── Accessors (lazy-load on first call) ──────────────────────────────────────

def get_judgment_texts():
    if not _loaded:
        load_models()
    return _judgment_texts


def get_model():
    if not _loaded:
        load_models()
    return _model


def get_case_names():
    if not _loaded:
        load_models()
    return _case_names


def get_embeddings():
    if not _loaded:
        load_models()
    return _embeddings


def get_modellog():
    if not _loaded:
        load_models()
    return _modellog

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
_judgment_texts = None
_model = None
_case_names = None
_embeddings = None
_modellog = None
_loaded = False  # Tracked for backward compatibility of is_loaded()


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
    global _loaded
    # Access all getters to force load everything eagerly if requested
    get_judgment_texts()
    get_model()
    get_case_names()
    get_embeddings()
    get_modellog()
    _loaded = True


def is_loaded() -> bool:
    """Check if all models/data files have been loaded into memory."""
    return (
        _judgment_texts is not None
        and _model is not None
        and _case_names is not None
        and _embeddings is not None
        and _modellog is not None
    )


# ── Accessors (lazy-load on first call) ──────────────────────────────────────

def get_judgment_texts():
    global _judgment_texts
    if _judgment_texts is None:
        with _lock:
            if _judgment_texts is None:
                models_dir = _get_models_dir()
                ensure_models(models_dir)
                print("[INFO] Loading judgment_texts.pkl...", flush=True)
                _judgment_texts = joblib.load(os.path.join(models_dir, "judgment_texts.pkl"))
                print("[INFO] [OK] judgment_texts.pkl loaded successfully", flush=True)
    return _judgment_texts


def get_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                models_dir = _get_models_dir()
                ensure_models(models_dir)
                print("[INFO] Loading model.pkl (SentenceTransformer)...", flush=True)
                loaded_model = joblib.load(os.path.join(models_dir, "model.pkl"))
                # Ensure SentenceTransformer uses CPU mode
                if hasattr(loaded_model, "to"):
                    loaded_model.to("cpu")
                _model = loaded_model
                print("[INFO] [OK] model.pkl (SentenceTransformer) loaded successfully and set to CPU mode", flush=True)
    return _model


def get_case_names():
    global _case_names
    if _case_names is None:
        with _lock:
            if _case_names is None:
                models_dir = _get_models_dir()
                ensure_models(models_dir)
                print("[INFO] Loading case_names.pkl...", flush=True)
                _case_names = joblib.load(os.path.join(models_dir, "case_names.pkl"))
                print("[INFO] [OK] case_names.pkl loaded successfully", flush=True)
    return _case_names


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        with _lock:
            if _embeddings is None:
                models_dir = _get_models_dir()
                ensure_models(models_dir)
                print("[INFO] Loading embeddings.pkl...", flush=True)
                _embeddings = joblib.load(os.path.join(models_dir, "embeddings.pkl"))
                print("[INFO] [OK] embeddings.pkl loaded successfully", flush=True)
    return _embeddings


def get_modellog():
    global _modellog
    if _modellog is None:
        with _lock:
            if _modellog is None:
                models_dir = _get_models_dir()
                ensure_models(models_dir)
                print("[INFO] Loading modellog.pkl...", flush=True)
                _modellog = joblib.load(os.path.join(models_dir, "modellog.pkl"))
                print("[INFO] [OK] modellog.pkl loaded successfully", flush=True)
    return _modellog

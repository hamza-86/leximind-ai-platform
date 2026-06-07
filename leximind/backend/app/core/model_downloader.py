"""
app/core/model_downloader.py

Automatic model downloader for Hugging Face hosted .pkl files.
Checks if each model file exists locally; downloads from HF if missing.
This is the ONLY download source — Hugging Face datasets repo.

Usage (called automatically by model_loader.py on first request):
    from app.core.model_downloader import ensure_models
    ensure_models(models_dir)
"""
import os
import urllib.request
import urllib.error

# ── Hugging Face URLs ─────────────────────────────────────────────────────────
HF_BASE = "https://huggingface.co/datasets/hamza86/leximind-models/resolve/main"

MODEL_FILES = {
    "case_names.pkl":    f"{HF_BASE}/case_names.pkl",
    "embeddings.pkl":    f"{HF_BASE}/embeddings.pkl",
    "judgment_texts.pkl":f"{HF_BASE}/judgment_texts.pkl",
    "model.pkl":         f"{HF_BASE}/model.pkl",
    "modellog.pkl":      f"{HF_BASE}/modellog.pkl",
}


def _download_file(url: str, dest_path: str) -> None:
    """Download a single file from a URL with progress reporting."""
    filename = os.path.basename(dest_path)
    print(f"[INFO] Downloading {filename} from Hugging Face …", flush=True)

    try:
        def _reporthook(block_num, block_size, total_size):
            if total_size > 0:
                downloaded = block_num * block_size
                pct = min(100, int(downloaded * 100 / total_size))
                mb_done = downloaded / (1024 * 1024)
                mb_total = total_size / (1024 * 1024)
                print(
                    f"\r[INFO]   {filename}: {pct}%  ({mb_done:.1f}/{mb_total:.1f} MB)",
                    end="",
                    flush=True,
                )

        urllib.request.urlretrieve(url, dest_path, reporthook=_reporthook)
        print(f"\n[INFO] ✓ {filename} saved to {dest_path}", flush=True)

    except urllib.error.URLError as exc:
        # Clean up partial download
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise RuntimeError(
            f"Failed to download {filename} from Hugging Face.\n"
            f"URL: {url}\n"
            f"Error: {exc}\n\n"
            "Please check:\n"
            "  1. Internet connection\n"
            "  2. Hugging Face dataset is public: https://huggingface.co/datasets/hamza86/leximind-models\n"
            "  3. Or place .pkl files manually in the models/ directory"
        ) from exc


def ensure_models(models_dir: str) -> None:
    """
    Ensure all required .pkl model files exist in models_dir.
    Downloads missing files from Hugging Face automatically.

    Args:
        models_dir: Absolute path to the local models directory.
    """
    os.makedirs(models_dir, exist_ok=True)

    missing = []
    for filename in MODEL_FILES:
        local_path = os.path.join(models_dir, filename)
        if not os.path.exists(local_path):
            missing.append(filename)

    if not missing:
        print("[INFO] All model files already cached locally.", flush=True)
        return

    print(f"[INFO] Missing model files: {missing}", flush=True)
    print(f"[INFO] Downloading from: {HF_BASE}", flush=True)

    for filename in missing:
        local_path = os.path.join(models_dir, filename)
        url = MODEL_FILES[filename]
        _download_file(url, local_path)

    print("[INFO] ✓ All model files ready.", flush=True)

"""
api/v1/analyze.py
/api/v1/analyze  – multipart form (text or PDF) → category + similar cases
Preserves all original Flask route behaviour from app.py POST /.
"""
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.schemas.search import AnalyzeResponse
from app.services.pdf_service import read_pdf_from_bytes
from app.services.search_service import analyze_judgment
from app.core.config import get_settings

router = APIRouter()

settings = get_settings()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    text_input: str = Form(default=""),
    file: UploadFile | None = File(default=None),
):
    """
    Analyse a legal judgment (text or PDF) and return:
      - predicted category
      - top-5 semantically similar cases
      - original document text (for chatbot context)
    """
    input_text = text_input.strip()

    # ── PDF branch ────────────────────────────────────────────────────────
    if not input_text:
        if file is None or file.filename == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ No input provided (paste text or upload a PDF).",
            )

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Only PDF files are allowed.",
            )

        pdf_bytes = await file.read()

        # Enforce upload size limit
        if len(pdf_bytes) > settings.MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Uploaded file is too large. Max size allowed is 10 MB.",
            )

        if not pdf_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Uploaded file is empty.",
            )

        input_text = read_pdf_from_bytes(pdf_bytes)
        del pdf_bytes  # privacy

        if input_text.startswith("[ERROR]"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"❌ PDF processing failed: {input_text}",
            )

    if not input_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="❌ No text could be extracted from the input.",
        )

    # ── Run ML pipeline ───────────────────────────────────────────────────
    try:
        category, results, original_document = analyze_judgment(input_text)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return AnalyzeResponse(
        category=category,
        results=results,
        original_document=original_document,
    )

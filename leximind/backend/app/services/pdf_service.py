"""
services/pdf_service.py
PDF text extraction — direct port of read_pdf_from_bytes() from app.py.
"""
import io

import pdfplumber
import PyPDF2


def read_pdf_from_bytes(file_bytes: bytes) -> str:
    """
    Extract text from PDF bytes without saving to disk.
    Tries pdfplumber first, falls back to PyPDF2 if needed.
    """
    text_pages: list[str] = []

    # Primary: pdfplumber
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                txt = page.extract_text()
                if txt:
                    text_pages.append(txt)
        if text_pages:
            return "\n".join(text_pages)
    except Exception:
        pass

    # Fallback: PyPDF2
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                text_pages.append(txt)
        return "\n".join(text_pages)
    except Exception as exc:
        return f"[ERROR] Could not extract PDF text: {exc}"

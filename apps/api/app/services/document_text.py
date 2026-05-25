from typing import Any

from app.services.ocr_engine import TesseractOCRProvider

TEXT_EXTENSIONS = (".txt", ".text", ".md", ".csv")


def is_text_document(filename: str, content_type: str) -> bool:
    return content_type.startswith("text/") or filename.lower().endswith(
        TEXT_EXTENSIONS
    )


def decode_text(body: bytes) -> str:
    return body.decode("utf-8", errors="replace").strip()


def extract_document_text(
    *,
    body: bytes,
    filename: str,
    content_type: str,
    settings: Any,
) -> tuple[str, str, list[dict[str, Any]]]:
    if is_text_document(filename, content_type):
        return decode_text(body), "text_upload", []

    ocr_result = TesseractOCRProvider(settings.tesseract_command).extract_text(
        body=body,
        filename=filename,
        content_type=content_type,
    )
    return ocr_result.text, ocr_result.provider, ocr_result.issues

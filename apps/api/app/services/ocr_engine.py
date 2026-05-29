from typing import Any
from app.services.ocr_models import OCRProvider, ExtractionProvider, OcrResult, ExtractionResult
from app.services.ollama_provider import OllamaExtractionProvider  # noqa: F401
from app.services.rule_based_provider import RuleBasedExtractionProvider  # noqa: F401
from app.services.tesseract_provider import (  # noqa: F401
    TesseractOCRProvider,
    is_image,
    is_pdf,
)
from app.services.rule_extractors import extract_fields


class OcrEngine:
    def __init__(self, ocr_provider: OCRProvider, extraction_provider: ExtractionProvider):
        self.ocr_provider = ocr_provider
        self.extraction_provider = extraction_provider

    def process(
        self,
        *,
        body: bytes,
        filename: str,
        content_type: str,
        document_type: str,
        schema_fields: list[dict[str, Any]],
    ) -> tuple[OcrResult, ExtractionResult]:
        ocr_result = self.ocr_provider.extract_text(
            body=body, filename=filename, content_type=content_type
        )
        extraction_result = self.extraction_provider.extract_fields(
            document_type=document_type,
            text=ocr_result.text,
            schema_fields=schema_fields,
        )
        return ocr_result, extraction_result


def get_ocr_engine(settings: Any, fallback: bool = False) -> OcrEngine:
    ocr_provider = TesseractOCRProvider(settings.tesseract_command)
    if not fallback:
        try:
            extraction_provider = OllamaExtractionProvider(
                base_url=settings.ollama_base_url,
                model=settings.ollama_model,
                timeout_seconds=settings.ollama_timeout_seconds,
            )
            return OcrEngine(ocr_provider, extraction_provider)
        except Exception:
            pass
    extraction_provider = RuleBasedExtractionProvider(extract_fields)
    return OcrEngine(ocr_provider, extraction_provider)


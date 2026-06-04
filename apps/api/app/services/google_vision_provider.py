import json
from io import BytesIO
from pathlib import Path
from typing import Any

from app.services.ocr_models import OcrPage, OcrResult
from app.services.tesseract_provider import is_image, is_pdf


class GoogleVisionOCRProvider:
    name = "google_vision"

    def __init__(
        self,
        *,
        credentials_json: str | None = None,
        fallback_provider: Any | None = None,
    ):
        self.credentials_json = credentials_json
        self.fallback_provider = fallback_provider

    def extract_text(
        self, *, body: bytes, filename: str, content_type: str
    ) -> OcrResult:
        try:
            if is_pdf(filename, content_type):
                return self._extract_pdf(body)
            if is_image(filename, content_type):
                return self._extract_image(body, page_number=1)
            return OcrResult(
                text="",
                issues=[
                    {
                        "field": "OCR",
                        "message": f"Unsupported Google Vision OCR content type: {content_type}",
                    }
                ],
                provider=self.name,
            )
        except Exception as exc:
            if self.fallback_provider is not None:
                return self.fallback_provider.extract_text(
                    body=body,
                    filename=filename,
                    content_type=content_type,
                )
            return OcrResult(
                text="",
                issues=[
                    {
                        "field": "OCR",
                        "message": f"Google Vision OCR unavailable: {exc}",
                    }
                ],
                provider=self.name,
            )

    def _extract_pdf(self, body: bytes) -> OcrResult:
        try:
            from pdf2image import convert_from_bytes
        except ImportError as exc:
            raise RuntimeError("pdf2image is required to render PDFs for Google Vision OCR.") from exc

        images = convert_from_bytes(body, dpi=150)
        text_parts: list[str] = []
        pages: list[OcrPage] = []
        issues: list[dict[str, Any]] = []

        for index, image in enumerate(images, start=1):
            with BytesIO() as buffer:
                image.save(buffer, format="PNG")
                page_result = self._extract_image(buffer.getvalue(), page_number=index)
            pages.extend(page_result.pages)
            issues.extend(page_result.issues)
            if page_result.text:
                text_parts.append(page_result.text)

        return OcrResult(
            text="\n\n".join(text_parts).strip(),
            pages=pages,
            issues=issues,
            provider=self.name,
        )

    def _extract_image(self, body: bytes, page_number: int) -> OcrResult:
        client = self._client()
        vision = self._vision_module()
        image = vision.Image(content=body)
        response = client.document_text_detection(image=image)

        if response.error.message:
            raise RuntimeError(response.error.message)

        text = (response.full_text_annotation.text or "").strip()
        issues = [] if text else [{"field": "OCR", "message": "Google Vision returned no text for this page."}]
        return OcrResult(
            text=text,
            pages=[OcrPage(page_number=page_number, text=text)],
            issues=issues,
            provider=self.name,
        )

    def _client(self):
        vision = self._vision_module()
        credentials = self._credentials()
        if credentials is not None:
            return vision.ImageAnnotatorClient(credentials=credentials)
        return vision.ImageAnnotatorClient()

    def _credentials(self):
        if not self.credentials_json:
            return None

        try:
            from google.oauth2 import service_account
        except ImportError as exc:
            raise RuntimeError("google-auth is required for service account credentials.") from exc

        try:
            info = json.loads(self.credentials_json)
        except json.JSONDecodeError as exc:
            raise RuntimeError("DOCFLOW_GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON.") from exc

        return service_account.Credentials.from_service_account_info(info)

    @staticmethod
    def _vision_module():
        try:
            from google.cloud import vision
        except ImportError as exc:
            raise RuntimeError("google-cloud-vision is not installed.") from exc
        return vision


def probe_google_vision_dependencies(credentials_json: str | None = None) -> list[str]:
    warnings: list[str] = []

    try:
        from google.cloud import vision  # noqa: F401
    except ImportError:
        warnings.append("Google Vision OCR package is not installed.")

    if credentials_json:
        try:
            json.loads(credentials_json)
        except json.JSONDecodeError:
            warnings.append("DOCFLOW_GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON.")
    else:
        import os

        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path:
            warnings.append(
                "Google Vision OCR needs DOCFLOW_GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS."
            )
        elif not Path(credentials_path).exists():
            warnings.append(f"GOOGLE_APPLICATION_CREDENTIALS file does not exist: {credentials_path}")

    return warnings

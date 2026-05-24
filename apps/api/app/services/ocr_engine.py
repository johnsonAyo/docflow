from __future__ import annotations

import json
import subprocess
import tempfile
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Protocol


@dataclass(frozen=True)
class OcrPage:
    page_number: int
    text: str
    confidence: float | None = None


@dataclass(frozen=True)
class OcrResult:
    text: str
    pages: list[OcrPage] = field(default_factory=list)
    issues: list[dict[str, Any]] = field(default_factory=list)
    provider: str = "none"


@dataclass(frozen=True)
class ExtractionResult:
    fields: list[dict[str, Any]]
    issues: list[dict[str, Any]]
    confidence: float
    provider: str


class OCRProvider(Protocol):
    name: str

    def extract_text(self, *, body: bytes, filename: str, content_type: str) -> OcrResult:
        raise NotImplementedError


class ExtractionProvider(Protocol):
    name: str

    def extract_fields(
        self,
        *,
        document_type: str,
        text: str,
        schema_fields: list[dict[str, Any]],
    ) -> ExtractionResult:
        raise NotImplementedError


def is_pdf(filename: str, content_type: str) -> bool:
    return content_type == "application/pdf" or filename.lower().endswith(".pdf")


def is_image(filename: str, content_type: str) -> bool:
    return content_type.startswith("image/") or filename.lower().endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff", ".webp"))


class TesseractOCRProvider:
    name = "tesseract"

    def __init__(self, command: str = "tesseract"):
        self.command = command

    def extract_text(self, *, body: bytes, filename: str, content_type: str) -> OcrResult:
        if is_pdf(filename, content_type):
            return self._extract_pdf(body)

        if is_image(filename, content_type):
            return self._extract_image(body, page_number=1)

        return OcrResult(
            text="",
            issues=[{"field": "OCR", "message": f"Unsupported OCR content type: {content_type}"}],
            provider=self.name,
        )

    def _extract_pdf(self, body: bytes) -> OcrResult:
        try:
            from pdf2image import convert_from_bytes
        except ImportError:
            return self._dependency_issue("pdf2image is required to split PDFs into page images.")

        try:
            images = convert_from_bytes(body)
        except Exception as exc:
            return OcrResult(
                text="",
                issues=[{"field": "OCR", "message": f"PDF page rendering failed: {exc}"}],
                provider=self.name,
            )

        pages: list[OcrPage] = []
        issues: list[dict[str, Any]] = []
        text_parts: list[str] = []

        for index, image in enumerate(images, start=1):
            with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
                image.save(tmp.name)
                page_result = self._extract_image_path(Path(tmp.name), index)
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
        with tempfile.NamedTemporaryFile(suffix=".image") as source:
            source.write(body)
            source.flush()
            return self._extract_image_path(Path(source.name), page_number)

    def _extract_image_path(self, image_path: Path, page_number: int) -> OcrResult:
        try:
            prepared_path = self._preprocess_image(image_path)
        except Exception:
            prepared_path = image_path

        try:
            completed = subprocess.run(
                [self.command, str(prepared_path), "stdout", "--psm", "6"],
                check=True,
                capture_output=True,
                text=True,
            )
        except FileNotFoundError:
            return self._dependency_issue(f"Tesseract command not found: {self.command}")
        except subprocess.CalledProcessError as exc:
            return OcrResult(
                text="",
                issues=[{"field": "OCR", "message": f"Tesseract failed: {exc.stderr.strip() or exc}"}],
                provider=self.name,
            )

        text = completed.stdout.strip()
        issue = [] if text else [{"field": "OCR", "message": "Tesseract returned no text for this page."}]
        return OcrResult(
            text=text,
            pages=[OcrPage(page_number=page_number, text=text, confidence=None)],
            issues=issue,
            provider=self.name,
        )

    def _preprocess_image(self, image_path: Path) -> Path:
        import cv2

        image = cv2.imread(str(image_path))
        if image is None:
            return image_path

        grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        denoised = cv2.fastNlMeansDenoising(grayscale, None, 30, 7, 21)
        threshold = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        target_path = image_path.with_suffix(".processed.png")
        cv2.imwrite(str(target_path), threshold)
        return target_path

    def _dependency_issue(self, message: str) -> OcrResult:
        return OcrResult(
            text="",
            issues=[{"field": "OCR", "message": message}],
            provider=self.name,
        )


class OllamaExtractionProvider:
    name = "ollama"

    def __init__(self, *, base_url: str, model: str, timeout_seconds: float):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout_seconds = timeout_seconds

    def extract_fields(
        self,
        *,
        document_type: str,
        text: str,
        schema_fields: list[dict[str, Any]],
    ) -> ExtractionResult:
        schema = {
            "type": "object",
            "properties": {
                "fields": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "value": {"type": "string"},
                            "confidence": {"type": "number"},
                            "evidence": {"type": "string"},
                        },
                        "required": ["name", "value", "confidence", "evidence"],
                    },
                },
                "issues": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "field": {"type": "string"},
                            "message": {"type": "string"},
                        },
                        "required": ["field", "message"],
                    },
                },
                "confidence": {"type": "number"},
            },
            "required": ["fields", "issues", "confidence"],
        }
        payload = {
            "model": self.model,
            "stream": False,
            "format": schema,
            "messages": [
                {
                    "role": "system",
                    "content": "Extract structured business document fields. Return only the requested JSON schema.",
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        {
                            "document_type": document_type,
                            "schema_fields": schema_fields,
                            "document_text": text[:12000],
                        }
                    ),
                },
            ],
        }

        try:
            request = urllib.request.Request(
                f"{self.base_url}/api/chat",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                response_body = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Ollama extraction failed: {exc}") from exc

        content = response_body.get("message", {}).get("content", "")
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise RuntimeError("Ollama returned non-JSON extraction output") from exc

        return ExtractionResult(
            fields=[
                {
                    "name": str(field.get("name", "")),
                    "value": str(field.get("value", "")),
                    "confidence": float(field.get("confidence", 0)),
                    "evidence": str(field.get("evidence", "")),
                }
                for field in parsed.get("fields", [])
                if isinstance(field, dict)
            ],
            issues=[
                {
                    "field": str(issue.get("field", "")),
                    "message": str(issue.get("message", "")),
                }
                for issue in parsed.get("issues", [])
                if isinstance(issue, dict)
            ],
            confidence=float(parsed.get("confidence", 0)),
            provider=self.name,
        )


class RuleBasedExtractionProvider:
    name = "rule_based"

    def __init__(self, extractor):
        self.extractor = extractor

    def extract_fields(
        self,
        *,
        document_type: str,
        text: str,
        schema_fields: list[dict[str, Any]],
    ) -> ExtractionResult:
        fields, issues, confidence = self.extractor(document_type, text)
        return ExtractionResult(
            fields=fields,
            issues=issues,
            confidence=confidence,
            provider=self.name,
        )

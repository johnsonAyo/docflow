import subprocess
import tempfile
from pathlib import Path
from typing import Any

from app.services.ocr_models import OcrPage, OcrResult


def is_pdf(filename: str, content_type: str) -> bool:
    return content_type == "application/pdf" or filename.lower().endswith(".pdf")


def is_image(filename: str, content_type: str) -> bool:
    return content_type.startswith("image/") or filename.lower().endswith(
        (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".webp")
    )


class TesseractOCRProvider:
    name = "tesseract"

    def __init__(self, command: str = "tesseract"):
        self.command = command

    def extract_text(
        self, *, body: bytes, filename: str, content_type: str
    ) -> OcrResult:
        from app.services.document_text import decode_text, is_text_document

        if is_text_document(filename, content_type):
            return OcrResult(
                text=decode_text(body),
                issues=[],
                provider="text_upload",
            )
        if is_pdf(filename, content_type):
            return self._extract_pdf(body)
        if is_image(filename, content_type):
            return self._extract_image(body, page_number=1)
        return OcrResult(
            text="",
            issues=[
                {
                    "field": "OCR",
                    "message": f"Unsupported OCR content type: {content_type}",
                }
            ],
            provider=self.name,
        )

    def _extract_pdf(self, body: bytes) -> OcrResult:
        try:
            from pdf2image import convert_from_bytes
        except ImportError:
            return self._dependency_issue(
                "pdf2image is required to split PDFs into page images."
            )
        try:
            images = convert_from_bytes(body)
        except Exception as exc:
            return OcrResult(
                text="",
                issues=[
                    {"field": "OCR", "message": f"PDF page rendering failed: {exc}"}
                ],
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
            completed = subprocess.run(
                [self.command, str(prepared_path), "stdout", "--psm", "6"],
                check=True,
                capture_output=True,
                text=True,
            )
        except FileNotFoundError:
            return self._dependency_issue(
                "OCR engine unavailable. Install Tesseract or update DOCFLOW_TESSERACT_COMMAND."
            )
        except subprocess.CalledProcessError as exc:
            return OcrResult(
                text="",
                issues=[
                    {
                        "field": "OCR",
                        "message": f"Tesseract failed: {exc.stderr.strip() or exc}",
                    }
                ],
                provider=self.name,
            )
        except Exception:
            return self._extract_image_path_without_preprocessing(
                image_path, page_number
            )
        return self._page_result(completed.stdout.strip(), page_number)

    def _extract_image_path_without_preprocessing(
        self, image_path: Path, page_number: int
    ) -> OcrResult:
        completed = subprocess.run(
            [self.command, str(image_path), "stdout", "--psm", "6"],
            check=True,
            capture_output=True,
            text=True,
        )
        return self._page_result(completed.stdout.strip(), page_number)

    def _preprocess_image(self, image_path: Path) -> Path:
        import cv2

        image = cv2.imread(str(image_path))
        if image is None:
            return image_path
        grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        denoised = cv2.fastNlMeansDenoising(grayscale, None, 30, 7, 21)
        threshold = cv2.threshold(
            denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )[1]
        target_path = image_path.with_suffix(".processed.png")
        cv2.imwrite(str(target_path), threshold)
        return target_path

    def _page_result(self, text: str, page_number: int) -> OcrResult:
        issue = (
            []
            if text
            else [
                {"field": "OCR", "message": "Tesseract returned no text for this page."}
            ]
        )
        return OcrResult(
            text=text,
            pages=[OcrPage(page_number=page_number, text=text)],
            issues=issue,
            provider=self.name,
        )

    def _dependency_issue(self, message: str) -> OcrResult:
        return OcrResult(
            text="", issues=[{"field": "OCR", "message": message}], provider=self.name
        )

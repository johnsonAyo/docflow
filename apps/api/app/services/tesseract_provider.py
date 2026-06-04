import shutil
import subprocess
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Any

from app.services.ocr_models import OcrPage, OcrResult


def probe_ocr_dependencies(command: str = "tesseract") -> list[str]:
    warnings: list[str] = []
    resolved_command = shutil.which(command) if command else None
    if resolved_command is None and command != "tesseract":
        resolved_command = shutil.which("tesseract")
    binary_to_check = resolved_command or command

    for binary, message in (
        (
            binary_to_check,
            "Tesseract OCR binary is not available on this server.",
        ),
        (
            "pdftoppm",
            "Poppler utilities are not available on this server, so PDF OCR may fail.",
        ),
    ):
        try:
            subprocess.run(
                [binary, "-h" if binary == "pdftoppm" else "--version"],
                check=True,
                capture_output=True,
                text=True,
            )
        except FileNotFoundError:
            warnings.append(message)
        except subprocess.CalledProcessError:
            # Some binaries exit non-zero on help/version flags; that still means the
            # executable exists, so we do not warn in that case.
            pass

    return warnings


def is_pdf(filename: str, content_type: str) -> bool:
    return content_type == "application/pdf" or filename.lower().endswith(".pdf")


def is_image(filename: str, content_type: str) -> bool:
    return content_type.startswith("image/") or filename.lower().endswith(
        (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".webp")
    )


class TesseractOCRProvider:
    name = "tesseract"

    def __init__(self, command: str = "tesseract"):
        self.command = self._resolve_command(command)

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
        text_result = self._extract_pdf_text(body)
        if text_result is not None and text_result.text:
            return text_result

        try:
            from pdf2image import convert_from_bytes
        except ImportError:
            return self._dependency_issue(
                "pdf2image is required to split PDFs into page images."
            )
        try:
            images = convert_from_bytes(body, dpi=150)
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
                timeout=120,
            )
        except subprocess.TimeoutExpired:
            return self._dependency_issue(
                "Tesseract timed out while processing this page. The document has been routed to review."
            )
        except FileNotFoundError:
            return self._dependency_issue(
                "OCR engine unavailable in this environment. Install Tesseract or update DOCFLOW_TESSERACT_COMMAND to enable OCR; this document has been routed to review."
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
            timeout=120,
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

    def _extract_pdf_text(self, body: bytes) -> OcrResult | None:
        try:
            from pypdf import PdfReader
        except ImportError:
            return None

        try:
            reader = PdfReader(BytesIO(body))
        except Exception:
            return None

        pages: list[OcrPage] = []
        text_parts: list[str] = []
        for index, page in enumerate(reader.pages, start=1):
            try:
                page_text = (page.extract_text() or "").strip()
            except Exception:
                page_text = ""
            pages.append(OcrPage(page_number=index, text=page_text))
            if page_text:
                text_parts.append(page_text)

        text = "\n\n".join(text_parts).strip()
        if not text:
            return None

        return OcrResult(text=text, pages=pages, issues=[], provider="pdf_text")

    @staticmethod
    def _resolve_command(command: str) -> str:
        resolved = shutil.which(command)
        if resolved:
            return resolved

        if command != "tesseract":
            fallback = shutil.which("tesseract")
            if fallback:
                return fallback

        return command

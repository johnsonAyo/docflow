from dataclasses import dataclass, field
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

    def extract_text(
        self, *, body: bytes, filename: str, content_type: str
    ) -> OcrResult:
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

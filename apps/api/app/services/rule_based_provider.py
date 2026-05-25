from typing import Any, Callable  # noqa: I001

from app.services.ocr_models import ExtractionResult


Extractor = Callable[
    [str, str], tuple[list[dict[str, Any]], list[dict[str, Any]], float]
]


class RuleBasedExtractionProvider:
    name = "rule_based"

    def __init__(self, extractor: Extractor):
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

import json
import urllib.error
import urllib.request
from typing import Any

from app.services.ocr_models import ExtractionResult


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
        response_body = self._send_request(document_type, text, schema_fields)
        content = response_body.get("message", {}).get("content", "")
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise RuntimeError("Ollama returned non-JSON extraction output") from exc
        return parsed_extraction(parsed, self.name)

    def _send_request(
        self, document_type: str, text: str, schema_fields: list[dict[str, Any]]
    ) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "stream": False,
            "format": extraction_schema(),
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
            with urllib.request.urlopen(
                request, timeout=self.timeout_seconds
            ) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Ollama extraction failed: {exc}") from exc


def extraction_schema() -> dict[str, Any]:
    field_schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "value": {"type": "string"},
            "confidence": {"type": "number"},
            "evidence": {"type": "string"},
        },
        "required": ["name", "value", "confidence", "evidence"],
    }
    issue_schema = {
        "type": "object",
        "properties": {"field": {"type": "string"}, "message": {"type": "string"}},
        "required": ["field", "message"],
    }
    return {
        "type": "object",
        "properties": {
            "fields": {"type": "array", "items": field_schema},
            "issues": {"type": "array", "items": issue_schema},
            "confidence": {"type": "number"},
        },
        "required": ["fields", "issues", "confidence"],
    }


def parsed_extraction(parsed: dict[str, Any], provider: str) -> ExtractionResult:
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
        provider=provider,
    )

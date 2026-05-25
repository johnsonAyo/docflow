from typing import Any

from app.infrastructure.document_store import DocumentStore, artifact_key
from app.infrastructure.repositories import ResourceStore
from app.services.ocr_engine import OllamaExtractionProvider, RuleBasedExtractionProvider
from app.services.rule_extractors import extract_fields


def ocr_review_result(
    *,
    document_run_id: str,
    issues: list[dict[str, Any]],
    provider: str,
    review_states: ResourceStore,
    workflow_id: str,
) -> dict[str, Any]:
    review_state = review_states.create_item({
        "workflow_id": workflow_id, "document_run_id": document_run_id, "record_id": None,
        "status": "open", "issues": issues or [{"field": "OCR", "message": "No text could be extracted."}],
        "assigned_to": "Operations", "decisions": [],
    })
    return {
        "status": "needs_review", "artifacts": [], "record": None, "review_state": review_state,
        "error": None,
        "processing": {"stage": "ocr_pending", "message": "OCR did not produce text. Check OCR dependencies or document quality.", "provider": provider},
    }


def extract_structured_fields(
    *,
    document_type: str,
    schema_fields: list[dict[str, Any]],
    settings: Any,
    text: str,
):
    try:
        return "ollama", OllamaExtractionProvider(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            timeout_seconds=settings.ollama_timeout_seconds,
        ).extract_fields(document_type=document_type, text=text, schema_fields=schema_fields)
    except RuntimeError as exc:
        extraction = RuleBasedExtractionProvider(extract_fields).extract_fields(
            document_type=document_type,
            text=text,
            schema_fields=schema_fields,
        )
        extraction.issues.append({"field": "Extraction", "message": str(exc)})
        return "rule_based_fallback", extraction


def store_record_result(
    *,
    context: dict[str, Any],
    document_store: DocumentStore,
    records: ResourceStore,
    review_states: ResourceStore,
    text: str,
) -> dict[str, Any]:
    text_artifact = document_store.put_object(
        artifact_key(f"processed/{context['workflow_id']}/{context['document_run_id']}/ocr", "ocr-text.txt"),
        text.encode("utf-8"),
        "text/plain",
    )
    issues = [*context["ocr_issues"], *context["extraction"].issues]
    record = records.create_item(record_document(context, issues, text_artifact))
    review_state = review_states.create_item(review_document(context, issues, record["id"]))
    return {
        "status": "needs_review" if issues else "approved",
        "artifacts": [{"kind": "ocr_text", **text_artifact}],
        "record": record,
        "review_state": review_state,
        "error": None,
        "processing": {"stage": "extracted", "message": "OCR text extracted and initial record created.", "ocr_provider": context["ocr_provider"], "extraction_provider": context["extraction_provider"]},
    }


def record_document(context: dict[str, Any], issues: list[dict[str, Any]], text_artifact: dict[str, Any]) -> dict[str, Any]:
    extraction = context["extraction"]
    return {
        "workflow_id": context["workflow_id"], "document_run_id": context["document_run_id"],
        "status": "needs_review" if issues or extraction.confidence < 0.82 else "approved",
        "fields": extraction.fields, "confidence": extraction.confidence,
        "evidence_refs": [{"kind": "ocr_text", "artifact_key": text_artifact["key"]}],
        "metadata": {"ocr_provider": context["ocr_provider"], "extraction_provider": context["extraction_provider"], "ollama_model": context["ollama_model"]},
    }


def review_document(context: dict[str, Any], issues: list[dict[str, Any]], record_id: str) -> dict[str, Any]:
    return {
        "workflow_id": context["workflow_id"], "document_run_id": context["document_run_id"],
        "record_id": record_id, "status": "open" if issues else "resolved",
        "issues": issues, "assigned_to": "Operations" if issues else None, "decisions": [],
    }

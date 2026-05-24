import re
from typing import Any

from app.infrastructure.document_store import DocumentStore, artifact_key
from app.infrastructure.repositories import ResourceStore
from app.services.ocr_engine import (
    OllamaExtractionProvider,
    RuleBasedExtractionProvider,
    TesseractOCRProvider,
)


TEXT_EXTENSIONS = (".txt", ".text", ".md", ".csv")


def is_text_document(filename: str, content_type: str) -> bool:
    return content_type.startswith("text/") or filename.lower().endswith(TEXT_EXTENSIONS)


def decode_text(body: bytes) -> str:
    return body.decode("utf-8", errors="replace").strip()


def money_match(text: str) -> str | None:
    match = re.search(r"(?:total|amount due)[:\s$]*([A-Z]{3}\s*)?\$?([0-9][0-9,]*(?:\.[0-9]{2})?)", text, re.IGNORECASE)
    if match is None:
        return None

    currency = (match.group(1) or "").strip()
    amount = match.group(2)
    return f"{currency} {amount}".strip()


def date_match(text: str) -> str | None:
    match = re.search(r"(?:due|effective|date)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})", text, re.IGNORECASE)
    if match is None:
        return None

    return match.group(1)


def extract_invoice_fields(text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], float]:
    vendor = re.search(r"vendor[:\s]*(.+)", text, re.IGNORECASE)
    invoice_number = re.search(r"invoice(?: number)?[:\s#-]*([A-Z0-9-]+)", text, re.IGNORECASE)
    total = money_match(text)
    due_date = date_match(text)

    fields = [
        {"name": "Vendor", "value": vendor.group(1).strip() if vendor else "", "confidence": 0.9 if vendor else 0.0},
        {"name": "Invoice number", "value": invoice_number.group(1).strip() if invoice_number else "", "confidence": 0.86 if invoice_number else 0.0},
        {"name": "Due date", "value": due_date or "", "confidence": 0.84 if due_date else 0.0},
        {"name": "Total amount", "value": total or "", "confidence": 0.82 if total else 0.0},
    ]
    issues = [
        {"field": field["name"], "message": "Required field missing"}
        for field in fields
        if not field["value"]
    ]
    confidence = sum(float(field["confidence"]) for field in fields) / len(fields)
    return fields, issues, confidence


def extract_contract_fields(text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], float]:
    auto_renewal = "renew" in text.lower()
    effective_date = date_match(text)
    payment_terms = re.search(r"payment terms?[:\s]*(.+)", text, re.IGNORECASE)

    fields = [
        {"name": "Counterparty", "value": "", "confidence": 0.0},
        {"name": "Effective date", "value": effective_date or "", "confidence": 0.84 if effective_date else 0.0},
        {"name": "Renewal clause", "value": "Auto-renewal detected" if auto_renewal else "", "confidence": 0.73 if auto_renewal else 0.0},
        {"name": "Payment terms", "value": payment_terms.group(1).strip() if payment_terms else "", "confidence": 0.8 if payment_terms else 0.0},
    ]
    issues = [
        {"field": field["name"], "message": "Required field missing"}
        for field in fields
        if not field["value"]
    ]
    if auto_renewal:
        issues.append({"field": "Renewal clause", "message": "Auto-renewal detected"})

    confidence = sum(float(field["confidence"]) for field in fields) / len(fields)
    return fields, issues, confidence


def extract_fields(document_type: str, text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], float]:
    if document_type.lower() == "invoice":
        return extract_invoice_fields(text)

    if document_type.lower() == "contract":
        return extract_contract_fields(text)

    fields = [
        {"name": "Document text", "value": text[:500], "confidence": 0.72 if text else 0.0},
    ]
    issues = [] if text else [{"field": "Document text", "message": "No text extracted"}]
    return fields, issues, 0.72 if text else 0.0


def process_uploaded_document(
    *,
    body: bytes,
    filename: str,
    content_type: str,
    workflow_id: str,
    document_type: str,
    document_run_id: str,
    workflow_config: dict[str, Any],
    settings: Any,
    document_store: DocumentStore,
    records: ResourceStore,
    review_states: ResourceStore,
) -> dict[str, Any]:
    if is_text_document(filename, content_type):
        text = decode_text(body)
        ocr_provider = "text_upload"
        ocr_issues: list[dict[str, Any]] = []
    else:
        ocr_result = TesseractOCRProvider(settings.tesseract_command).extract_text(
            body=body,
            filename=filename,
            content_type=content_type,
        )
        text = ocr_result.text
        ocr_provider = ocr_result.provider
        ocr_issues = ocr_result.issues

    if not text:
        review_state = review_states.create_item(
            {
                "workflow_id": workflow_id,
                "document_run_id": document_run_id,
                "record_id": None,
                "status": "open",
                "issues": ocr_issues or [{"field": "OCR", "message": "No text could be extracted."}],
                "assigned_to": "Operations",
                "decisions": [],
            }
        )
        return {
            "status": "needs_review",
            "artifacts": [],
            "record": None,
            "review_state": review_state,
            "error": None,
            "processing": {
                "stage": "ocr_pending",
                "message": "OCR did not produce text. Check OCR dependencies or document quality.",
                "provider": ocr_provider,
            },
        }

    text_artifact = document_store.put_object(
        artifact_key(f"processed/{workflow_id}/{document_run_id}/ocr", "ocr-text.txt"),
        text.encode("utf-8"),
        "text/plain",
    )
    schema_fields = workflow_config.get("fields", [])
    extraction_provider = "ollama"

    try:
        extraction = OllamaExtractionProvider(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            timeout_seconds=settings.ollama_timeout_seconds,
        ).extract_fields(
            document_type=document_type,
            text=text,
            schema_fields=schema_fields if isinstance(schema_fields, list) else [],
        )
    except RuntimeError as exc:
        extraction = RuleBasedExtractionProvider(extract_fields).extract_fields(
            document_type=document_type,
            text=text,
            schema_fields=schema_fields if isinstance(schema_fields, list) else [],
        )
        extraction_provider = "rule_based_fallback"
        extraction.issues.append(
            {
                "field": "Extraction",
                "message": str(exc),
            }
        )

    issues = [*ocr_issues, *extraction.issues]
    record_status = "needs_review" if issues or extraction.confidence < 0.82 else "approved"
    record = records.create_item(
        {
            "workflow_id": workflow_id,
            "document_run_id": document_run_id,
            "status": record_status,
            "fields": extraction.fields,
            "confidence": extraction.confidence,
            "evidence_refs": [
                {"kind": "ocr_text", "artifact_key": text_artifact["key"]},
            ],
            "metadata": {
                "ocr_provider": ocr_provider,
                "extraction_provider": extraction_provider,
                "ollama_model": settings.ollama_model if extraction_provider == "ollama" else None,
            },
        }
    )
    review_state = review_states.create_item(
        {
            "workflow_id": workflow_id,
            "document_run_id": document_run_id,
            "record_id": record["id"],
            "status": "open" if issues else "resolved",
            "issues": issues,
            "assigned_to": "Operations" if issues else None,
            "decisions": [],
        }
    )

    return {
        "status": "needs_review" if issues else "approved",
        "artifacts": [{"kind": "ocr_text", **text_artifact}],
        "record": record,
        "review_state": review_state,
        "error": None,
        "processing": {
            "stage": "extracted",
            "message": "OCR text extracted and initial record created.",
            "ocr_provider": ocr_provider,
            "extraction_provider": extraction_provider,
        },
    }

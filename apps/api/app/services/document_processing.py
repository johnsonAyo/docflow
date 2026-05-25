from typing import Any  # noqa: I001

from app.infrastructure.document_store import DocumentStore
from app.infrastructure.repositories import ResourceStore
from app.services.document_processing_helpers import (
    extract_structured_fields,
    ocr_review_result,
    store_record_result,
)
from app.services.document_text import (
    extract_document_text,
)  # noqa: F401
from app.services.rule_extractors import (
    date_match,  # noqa: F401
    extract_contract_fields,  # noqa: F401
    extract_fields,  # noqa: F401
    extract_invoice_fields,  # noqa: F401
    money_match,  # noqa: F401
)


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
    text, ocr_provider, ocr_issues = extract_document_text(
        body=body,
        filename=filename,
        content_type=content_type,
        settings=settings,
    )
    if not text:
        return ocr_review_result(
            document_run_id=document_run_id,
            issues=ocr_issues,
            provider=ocr_provider,
            review_states=review_states,
            workflow_id=workflow_id,
        )

    schema_fields = workflow_config.get("fields", [])
    extraction_provider, extraction = extract_structured_fields(
        document_type=document_type,
        text=text,
        schema_fields=schema_fields if isinstance(schema_fields, list) else [],
        settings=settings,
    )
    return store_record_result(
        context={
            "document_run_id": document_run_id,
            "extraction": extraction,
            "extraction_provider": extraction_provider,
            "ocr_issues": ocr_issues,
            "ocr_provider": ocr_provider,
            "ollama_model": settings.ollama_model
            if extraction_provider == "ollama"
            else None,
            "workflow_id": workflow_id,
        },
        document_store=document_store,
        records=records,
        review_states=review_states,
        text=text,
    )

from typing import Any  # noqa: I001

from app.infrastructure.document_store import DocumentStore, artifact_key
from app.infrastructure.repositories import ResourceStore
from app.services.document_processing_helpers import (
    ocr_review_result,
)
from app.services.ocr_engine import get_ocr_engine


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
    run_document_run: dict[str, Any] | None = None,
) -> dict[str, Any]:
    # 1. Determine files to process
    originals = []
    if run_document_run:
        originals = [
            art
            for art in run_document_run.get("artifacts", [])
            if art.get("kind") == "original"
        ]

    if not originals:
        # Fall back to single file for backward compatibility (e.g. tests)
        originals = [
            {
                "key": f"uploads/{workflow_id}/originals/{filename}",
                "filename": filename,
                "content_type": content_type,
                "body": body,
            }
        ]

    all_fields = []
    all_issues = []
    all_ocr_artifacts = []
    all_ocr_providers = []
    all_extraction_providers = []
    confidences = []

    for art in originals:
        fname = art.get("filename", filename)
        ctype = art.get("content_type", content_type)

        fbody = art.get("body")
        if fbody is None:
            # Download from store
            try:
                fbody = document_store.get_object(art["key"])
            except Exception:
                # If key is missing or not in MinIO yet, default to single body passed
                fbody = body

        # Try to process with Ollama first
        try:
            engine = get_ocr_engine(settings, fallback=False)
            ocr_res, ext_res = engine.process(
                body=fbody,
                filename=fname,
                content_type=ctype,
                document_type=document_type,
                schema_fields=workflow_config.get("fields", []),
            )
            extraction_provider = "ollama"
        except Exception as exc:
            # Fall back to RuleBased
            engine = get_ocr_engine(settings, fallback=True)
            ocr_res, ext_res = engine.process(
                body=fbody,
                filename=fname,
                content_type=ctype,
                document_type=document_type,
                schema_fields=workflow_config.get("fields", []),
            )
            ext_res.issues.append({"field": "Extraction", "message": str(exc)})
            extraction_provider = "rule_based_fallback"

        all_ocr_providers.append(ocr_res.provider)
        all_extraction_providers.append(extraction_provider)
        confidences.append(ext_res.confidence)

        # Tag OCR issues with filename
        for issue in ocr_res.issues:
            issue["filename"] = fname
            all_issues.append(issue)

        if not ocr_res.text:
            all_issues.append(
                {
                    "field": "OCR",
                    "message": f"No text could be extracted for {fname}.",
                    "filename": fname,
                }
            )
            continue

        # Save OCR text to store
        text_artifact = document_store.put_object(
            artifact_key(
                f"processed/{workflow_id}/{document_run_id}/ocr",
                f"{fname}-ocr-text.txt",
            ),
            ocr_res.text.encode("utf-8"),
            "text/plain",
        )
        all_ocr_artifacts.append(
            {**text_artifact, "kind": "ocr_text", "filename": fname}
        )

        # Tag extracted fields and issues with filename
        for field in ext_res.fields:
            field["filename"] = fname
            all_fields.append(field)

        for issue in ext_res.issues:
            issue["filename"] = fname
            all_issues.append(issue)

    # 2. Combine results
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    ocr_provider_str = ",".join(list(set(all_ocr_providers)))
    extraction_provider_str = ",".join(list(set(all_extraction_providers)))

    # If OCR produced no text at all across the entire bundle, return ocr_review_result
    if not all_ocr_artifacts:
        return ocr_review_result(
            document_run_id=document_run_id,
            issues=all_issues,
            provider=ocr_provider_str or "tesseract",
            review_states=review_states,
            workflow_id=workflow_id,
        )

    # Store record and review state
    record = records.create_item(
        {
            "workflow_id": workflow_id,
            "document_run_id": document_run_id,
            "status": "needs_review"
            if all_issues or avg_confidence < 0.82
            else "approved",
            "fields": all_fields,
            "confidence": avg_confidence,
            "evidence_refs": all_ocr_artifacts,
            "metadata": {
                "ocr_provider": ocr_provider_str,
                "extraction_provider": extraction_provider_str,
                "ollama_model": settings.ollama_model
                if "ollama" in extraction_provider_str
                else None,
            },
        }
    )

    review_state = review_states.create_item(
        {
            "workflow_id": workflow_id,
            "document_run_id": document_run_id,
            "record_id": record["id"],
            "status": "open" if all_issues else "resolved",
            "issues": all_issues,
            "assigned_to": "Operations" if all_issues else None,
            "decisions": [],
        }
    )

    return {
        "status": "needs_review" if all_issues else "approved",
        "artifacts": all_ocr_artifacts,
        "record": record,
        "review_state": review_state,
        "error": None,
        "processing": {
            "stage": "extracted",
            "message": "OCR text extracted and initial record created.",
            "ocr_provider": ocr_provider_str,
            "extraction_provider": extraction_provider_str,
        },
    }

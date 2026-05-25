from typing import Any

from fastapi import UploadFile

from app.core.exceptions import MissingArtifactBodyError
from app.infrastructure.document_store import DocumentStore, artifact_key
from app.infrastructure.repositories import ResourceStore, WorkflowDefinitionStore
from app.services.document_processing import process_uploaded_document


async def create_uploaded_document(
    *,
    document_type: str,
    file: UploadFile,
    resource_stores: dict[str, ResourceStore],
    settings: Any,
    store: DocumentStore,
    workflow_id: str,
    workflow_store: WorkflowDefinitionStore,
) -> dict[str, Any]:
    body = await file.read()
    if not body:
        raise MissingArtifactBodyError()

    filename = file.filename or "document"
    content_type = file.content_type or "application/octet-stream"
    artifact = store.put_object(
        artifact_key(f"uploads/{workflow_id}/originals", filename), body, content_type
    )
    document_run = create_document_run(
        resource_stores["document_runs"],
        workflow_id,
        document_type,
        filename,
        content_type,
        body,
        artifact,
    )
    workflow = workflow_store.get_workflow(workflow_id)

    use_celery_worker = getattr(settings, "use_celery_worker", False) is True

    if not use_celery_worker:
        processing = process_uploaded_document(
            body=body,
            filename=filename,
            content_type=content_type,
            workflow_id=workflow_id,
            document_type=document_type,
            document_run_id=document_run["id"],
            workflow_config=workflow["config"] if workflow is not None else {},
            settings=settings,
            document_store=store,
            records=resource_stores["records"],
            review_states=resource_stores["review_states"],
        )
        return upload_response(
            document_run, resource_stores["document_runs"], artifact, processing
        )

    try:
        from app.worker import process_document_task

        process_document_task.delay(
            document_run_id=document_run["id"],
            workflow_id=workflow_id,
            document_type=document_type,
            filename=filename,
            content_type=content_type,
            artifact=artifact,
        )
    except Exception:
        processing = process_uploaded_document(
            body=body,
            filename=filename,
            content_type=content_type,
            workflow_id=workflow_id,
            document_type=document_type,
            document_run_id=document_run["id"],
            workflow_config=workflow["config"] if workflow is not None else {},
            settings=settings,
            document_store=store,
            records=resource_stores["records"],
            review_states=resource_stores["review_states"],
        )
        return upload_response(
            document_run, resource_stores["document_runs"], artifact, processing
        )

    return {
        "document_run": document_run,
        "artifact": artifact,
        "record": None,
        "review_state": None,
    }


def create_document_run(
    store: ResourceStore,
    workflow_id: str,
    document_type: str,
    filename: str,
    content_type: str,
    body: bytes,
    artifact: dict[str, Any],
) -> dict[str, Any]:
    return store.create_item(
        {
            "workflow_id": workflow_id,
            "document_name": filename,
            "document_type": document_type,
            "status": "uploaded",
            "artifacts": [{"kind": "original", **artifact}],
            "error": None,
            "metadata": {
                "upload": {
                    "filename": filename,
                    "content_type": content_type,
                    "size_bytes": len(body),
                },
                "processing": {
                    "stage": "uploaded",
                    "message": "Original document stored. OCR processing has not started.",
                },
            },
        }
    )


def upload_response(
    document_run: dict[str, Any],
    store: ResourceStore,
    artifact: dict[str, Any],
    processing: dict[str, Any],
) -> dict[str, Any]:
    updated_run = (
        store.update_item(
            document_run["id"],
            {
                "status": processing["status"],
                "artifacts": [*document_run["artifacts"], *processing["artifacts"]],
                "error": processing["error"],
                "metadata": {
                    **document_run["metadata"],
                    "processing": processing["processing"],
                },
            },
        )
        or document_run
    )
    return {
        "document_run": updated_run,
        "artifact": artifact,
        "record": processing["record"],
        "review_state": processing["review_state"],
    }

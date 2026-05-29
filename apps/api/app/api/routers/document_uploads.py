from typing import Any

from fastapi import UploadFile

from app.core.exceptions import MissingArtifactBodyError
from app.infrastructure.document_store import DocumentStore, artifact_key
from app.infrastructure.repositories import ResourceStore, WorkflowDefinitionStore
from app.services.document_processing import process_uploaded_document


async def create_uploaded_document(
    *,
    document_type: str,
    resource_stores: dict[str, ResourceStore],
    settings: Any,
    store: DocumentStore,
    workflow_id: str,
    workflow_store: WorkflowDefinitionStore,
    file: UploadFile | None = None,
    files: list[UploadFile] | None = None,
    bundle_title: str | None = None,
) -> dict[str, Any]:
    upload_files = []
    if files:
        upload_files.extend(files)
    if file:
        upload_files.append(file)

    if not upload_files:
        raise MissingArtifactBodyError("No files provided.")

    artifacts = []
    bodies = []
    filenames = []
    content_types = []

    for f in upload_files:
        body = await f.read()
        if not body:
            continue
        fname = f.filename or "document"
        ctype = f.content_type or "application/octet-stream"

        artifact = store.put_object(
            artifact_key(f"uploads/{workflow_id}/originals", fname), body, ctype
        )
        artifacts.append({**artifact, "kind": "original", "filename": fname})
        bodies.append(body)
        filenames.append(fname)
        content_types.append(ctype)

    if not artifacts:
        raise MissingArtifactBodyError("No valid file content could be read.")

    run_title = bundle_title or filenames[0]
    bundle_metadata = {
        "files": [
            {
                "filename": fname,
                "content_type": ctype,
                "size_bytes": len(b),
            }
            for fname, ctype, b in zip(filenames, content_types, bodies)
        ]
    }

    document_run = resource_stores["document_runs"].create_item(
        {
            "workflow_id": workflow_id,
            "document_name": run_title,
            "document_type": document_type,
            "status": "uploaded",
            "artifacts": artifacts,
            "error": None,
            "metadata": {
                "bundle": bundle_metadata,
                "upload": {
                    "filename": run_title,
                    "content_type": content_types[0],
                    "size_bytes": sum(len(b) for b in bodies),
                },
                "processing": {
                    "stage": "uploaded",
                    "message": "Original bundle documents stored. OCR processing has not started.",
                },
            },
        }
    )
    workflow = workflow_store.get_workflow(workflow_id)

    use_celery_worker = getattr(settings, "use_celery_worker", False) is True

    if not use_celery_worker:
        try:
            processing = process_uploaded_document(
                body=bodies[0],
                filename=filenames[0],
                content_type=content_types[0],
                workflow_id=workflow_id,
                document_type=document_type,
                document_run_id=document_run["id"],
                workflow_config=workflow["config"] if workflow is not None else {},
                settings=settings,
                document_store=store,
                records=resource_stores["records"],
                review_states=resource_stores["review_states"],
                run_document_run=document_run,
            )
            return upload_response(
                document_run, resource_stores["document_runs"], artifacts[0], processing
            )
        except Exception as e:
            resource_stores["document_runs"].update_item(
                document_run["id"],
                {
                    "status": "failed",
                    "error": str(e),
                },
            )
            raise

    try:
        from app.worker import process_document_task

        process_document_task.delay(
            document_run_id=document_run["id"],
            workflow_id=workflow_id,
            document_type=document_type,
            filename=filenames[0],
            content_type=content_types[0],
            artifact=artifacts[0],
        )
    except Exception:
        try:
            processing = process_uploaded_document(
                body=bodies[0],
                filename=filenames[0],
                content_type=content_types[0],
                workflow_id=workflow_id,
                document_type=document_type,
                document_run_id=document_run["id"],
                workflow_config=workflow["config"] if workflow is not None else {},
                settings=settings,
                document_store=store,
                records=resource_stores["records"],
                review_states=resource_stores["review_states"],
                run_document_run=document_run,
            )
            return upload_response(
                document_run, resource_stores["document_runs"], artifacts[0], processing
            )
        except Exception as e:
            resource_stores["document_runs"].update_item(
                document_run["id"],
                {
                    "status": "failed",
                    "error": str(e),
                },
            )
            raise

    return {
        "document_run": document_run,
        "artifact": artifacts[0],
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

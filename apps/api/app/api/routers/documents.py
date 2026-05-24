from typing import Any

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile, status

from app.core.exceptions import InvalidArtifactKeyError, MissingArtifactBodyError
from app.core.rate_limit import rate_limit
from app.domain.models import ArtifactResponse
from app.infrastructure.document_store import DocumentStore, artifact_key, safe_object_key
from app.infrastructure.repositories import ResourceStore, WorkflowDefinitionStore
from app.services.document_processing import process_uploaded_document

router = APIRouter(prefix="/documents", tags=["documents"])

def get_document_store(request: Request) -> DocumentStore:
    return request.app.state.document_store

def get_document_run_store(request: Request) -> ResourceStore:
    return request.app.state.resource_stores["document_runs"]

def get_resource_stores(request: Request) -> dict[str, ResourceStore]:
    return request.app.state.resource_stores

def get_workflow_store(request: Request) -> WorkflowDefinitionStore:
    return request.app.state.workflow_store

def get_settings(request: Request) -> Any:
    return request.app.state.settings

@router.put(
    "/artifacts/{object_key:path}",
    response_model=ArtifactResponse,
    dependencies=[Depends(rate_limit)]
)
async def put_document_artifact(
    request: Request,
    object_key: str,
    store: DocumentStore = Depends(get_document_store)
) -> dict[str, Any]:
    try:
        key = safe_object_key(object_key)
    except ValueError as exc:
        raise InvalidArtifactKeyError(str(exc)) from exc

    body = await request.body()
    if not body:
        raise MissingArtifactBodyError()

    content_type = request.headers.get("content-type", "application/octet-stream")
    return store.put_object(key, body, content_type)


@router.post(
    "/uploads",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit)],
)
async def upload_document(
    workflow_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    store: DocumentStore = Depends(get_document_store),
    resource_stores: dict[str, ResourceStore] = Depends(get_resource_stores),
    workflow_store: WorkflowDefinitionStore = Depends(get_workflow_store),
    settings: Any = Depends(get_settings),
) -> dict[str, Any]:
    body = await file.read()
    if not body:
        raise MissingArtifactBodyError()

    filename = file.filename or "document"
    content_type = file.content_type or "application/octet-stream"
    key = artifact_key(f"uploads/{workflow_id}/originals", filename)
    artifact = store.put_object(key, body, content_type)
    document_runs = resource_stores["document_runs"]
    workflow = workflow_store.get_workflow(workflow_id)
    workflow_config = workflow["config"] if workflow is not None else {}

    document_run = document_runs.create_item(
        {
            "workflow_id": workflow_id,
            "document_name": filename,
            "document_type": document_type,
            "status": "uploaded",
            "artifacts": [
                {
                    "kind": "original",
                    **artifact,
                }
            ],
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
    processing = process_uploaded_document(
        body=body,
        filename=filename,
        content_type=content_type,
        workflow_id=workflow_id,
        document_type=document_type,
        document_run_id=document_run["id"],
        workflow_config=workflow_config,
        settings=settings,
        document_store=store,
        records=resource_stores["records"],
        review_states=resource_stores["review_states"],
    )
    processed_artifacts = [
        *document_run["artifacts"],
        *processing["artifacts"],
    ]
    updated_run = document_runs.update_item(
        document_run["id"],
        {
            "status": processing["status"],
            "artifacts": processed_artifacts,
            "error": processing["error"],
            "metadata": {
                **document_run["metadata"],
                "processing": processing["processing"],
            },
        },
    ) or document_run

    return {
        "document_run": updated_run,
        "artifact": artifact,
        "record": processing["record"],
        "review_state": processing["review_state"],
    }

from typing import Any

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile, status

from app.api.routers.document_dependencies import (
    get_document_store,
    get_resource_stores,
    get_settings,
    get_workflow_store,
)
from app.api.routers.document_uploads import create_uploaded_document
from app.core.exceptions import InvalidArtifactKeyError, MissingArtifactBodyError
from app.core.rate_limit import rate_limit
from app.domain.models import ArtifactResponse
from app.infrastructure.document_store import DocumentStore, safe_object_key
from app.infrastructure.repositories import ResourceStore, WorkflowDefinitionStore

router = APIRouter(prefix="/documents", tags=["documents"])


@router.put(
    "/artifacts/{object_key:path}",
    response_model=ArtifactResponse,
    dependencies=[Depends(rate_limit)],
)
async def put_document_artifact(
    request: Request,
    object_key: str,
    store: DocumentStore = Depends(get_document_store),
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
    "/uploads", status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit)]
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
    return await create_uploaded_document(
        document_type=document_type,
        file=file,
        resource_stores=resource_stores,
        settings=settings,
        store=store,
        workflow_id=workflow_id,
        workflow_store=workflow_store,
    )

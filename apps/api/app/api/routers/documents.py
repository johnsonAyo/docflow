from typing import Any

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile, status, HTTPException, Response

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


@router.get(
    "/artifacts/{object_key:path}",
    dependencies=[Depends(rate_limit)],
)
def get_document_artifact(
    object_key: str,
    store: DocumentStore = Depends(get_document_store),
):
    try:
        key = safe_object_key(object_key)
        content = store.get_object(key)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Artifact not found") from exc

    return Response(content=content, media_type="text/plain")


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
    file: UploadFile | None = File(None),
    files: list[UploadFile] | None = File(None),
    bundle_title: str | None = Form(None),
    store: DocumentStore = Depends(get_document_store),
    resource_stores: dict[str, ResourceStore] = Depends(get_resource_stores),
    workflow_store: WorkflowDefinitionStore = Depends(get_workflow_store),
    settings: Any = Depends(get_settings),
) -> dict[str, Any]:
    upload_files = []
    if files:
        upload_files.extend(files)
    if file:
        upload_files.append(file)

    if not upload_files:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No files uploaded.")

    return await create_uploaded_document(
        document_type=document_type,
        files=upload_files,
        resource_stores=resource_stores,
        settings=settings,
        store=store,
        workflow_id=workflow_id,
        workflow_store=workflow_store,
        bundle_title=bundle_title,
    )

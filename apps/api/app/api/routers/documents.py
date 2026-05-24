from typing import Any

from fastapi import APIRouter, Depends, Request

from app.core.exceptions import InvalidArtifactKeyError, MissingArtifactBodyError
from app.core.rate_limit import rate_limit
from app.domain.models import ArtifactResponse
from app.infrastructure.document_store import DocumentStore, safe_object_key

router = APIRouter(prefix="/documents", tags=["documents"])

def get_document_store(request: Request) -> DocumentStore:
    return request.app.state.document_store

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

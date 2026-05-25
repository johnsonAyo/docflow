from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.routers.workflow_dependencies import (
    fetch_workflow_or_404,
    get_workflow_store,
)
from app.api.routers.workflow_updates import apply_workflow_update
from app.domain.models import WorkflowCreate, WorkflowResponse, WorkflowUpdate
from app.infrastructure.repositories import WorkflowDefinitionStore, workflow_response
from app.services.workflow_service import (
    build_config,
    build_workflow_document,
    slugify,
)

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.get("", response_model=list[WorkflowResponse])
def list_workflows(
    store: WorkflowDefinitionStore = Depends(get_workflow_store),
) -> list[dict[str, Any]]:
    return [workflow_response(workflow) for workflow in store.list_workflows()]


@router.post(
    "",
    response_model=WorkflowResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workflow(
    payload: WorkflowCreate,
    store: WorkflowDefinitionStore = Depends(get_workflow_store),
) -> dict[str, Any]:
    config = build_config(payload)
    workflow = build_workflow_document(
        name=payload.name,
        document_type=payload.document_type,
        status=payload.status.value,
        slug=slugify(payload.name),
        config=config,
    )
    return workflow_response(store.create_workflow(workflow))


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(
    workflow_id: str, store: WorkflowDefinitionStore = Depends(get_workflow_store)
) -> dict[str, Any]:
    return workflow_response(fetch_workflow_or_404(store, workflow_id))


@router.get("/{workflow_id}/config")
def get_workflow_config(
    workflow_id: str, store: WorkflowDefinitionStore = Depends(get_workflow_store)
) -> dict[str, Any]:
    workflow = fetch_workflow_or_404(store, workflow_id)
    return workflow["config"]


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: str,
    payload: WorkflowUpdate,
    store: WorkflowDefinitionStore = Depends(get_workflow_store),
) -> dict[str, Any]:
    workflow = fetch_workflow_or_404(store, workflow_id)
    updated_workflow = apply_workflow_update(
        payload=payload,
        store=store,
        workflow=workflow,
        workflow_id=workflow_id,
    )
    return workflow_response(updated_workflow)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: str, store: WorkflowDefinitionStore = Depends(get_workflow_store)
) -> None:
    if not store.delete_workflow(workflow_id):
        fetch_workflow_or_404(store, workflow_id)

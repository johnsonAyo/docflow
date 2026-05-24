from typing import Any

from fastapi import APIRouter, Depends, Request, status

from app.core.exceptions import WorkflowNotFoundError
from app.domain.models import WorkflowCreate, WorkflowResponse, WorkflowUpdate
from app.infrastructure.repositories import WorkflowDefinitionStore, workflow_response
from app.services.workflow_service import (
    build_config,
    build_workflow_document,
    slugify,
    update_config,
)

router = APIRouter(prefix="/workflows", tags=["workflows"])

def get_workflow_store(request: Request) -> WorkflowDefinitionStore:
    return request.app.state.workflow_store

def fetch_workflow_or_404(
    store: WorkflowDefinitionStore,
    workflow_id: str,
) -> dict[str, Any]:
    workflow = store.get_workflow(workflow_id)

    if workflow is None:
        raise WorkflowNotFoundError()

    return workflow

@router.get("", response_model=list[WorkflowResponse])
def list_workflows(store: WorkflowDefinitionStore = Depends(get_workflow_store)) -> list[dict[str, Any]]:
    return [
        workflow_response(workflow)
        for workflow in store.list_workflows()
    ]


@router.post(
    "",
    response_model=WorkflowResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workflow(
    payload: WorkflowCreate,
    store: WorkflowDefinitionStore = Depends(get_workflow_store)
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
    workflow_id: str,
    store: WorkflowDefinitionStore = Depends(get_workflow_store)
) -> dict[str, Any]:
    return workflow_response(fetch_workflow_or_404(store, workflow_id))


@router.get("/{workflow_id}/config")
def get_workflow_config(
    workflow_id: str,
    store: WorkflowDefinitionStore = Depends(get_workflow_store)
) -> dict[str, Any]:
    workflow = fetch_workflow_or_404(store, workflow_id)
    return workflow["config"]


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: str,
    payload: WorkflowUpdate,
    store: WorkflowDefinitionStore = Depends(get_workflow_store)
) -> dict[str, Any]:
    workflow = fetch_workflow_or_404(store, workflow_id)
    updates = payload.model_dump(exclude_unset=True, mode="json")

    name = updates.get("name", workflow["name"])
    document_type = updates.get("document_type", workflow["document_type"])
    workflow_status = updates.get("status", workflow["status"])
    config = update_config(workflow["config"], updates)

    updated_workflow = store.update_workflow(
        workflow_id,
        {
            "name": name,
            "document_type": document_type,
            "status": workflow_status,
            "config": config,
        },
    )

    if updated_workflow is None:
        raise WorkflowNotFoundError()

    return workflow_response(updated_workflow)

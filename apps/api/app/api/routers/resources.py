from typing import Any

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from app.core.exceptions import ResourceNotFoundError
from app.domain.models import (
    ActionHistoryCreate,
    ActionHistoryResponse,
    DocumentRunCreate,
    DocumentRunResponse,
    DocumentRunUpdate,
    ExtractedRecordCreate,
    ExtractedRecordResponse,
    ExtractedRecordUpdate,
    IntegrationLogCreate,
    IntegrationLogResponse,
    IntegrationLogUpdate,
    ReviewStateCreate,
    ReviewStateResponse,
    ReviewStateUpdate,
)
from app.infrastructure.repositories import ResourceStore

router = APIRouter(tags=["metadata"])


def get_resource_stores(request: Request) -> dict[str, ResourceStore]:
    return request.app.state.resource_stores


def get_store(
    stores: dict[str, ResourceStore],
    resource_name: str,
) -> ResourceStore:
    return stores[resource_name]


def create_resource(
    store: ResourceStore,
    payload: BaseModel,
) -> dict[str, Any]:
    return store.create_item(payload.model_dump(mode="json"))


def list_resources(
    store: ResourceStore,
    workflow_id: str | None = None,
    document_run_id: str | None = None,
    record_id: str | None = None,
) -> list[dict[str, Any]]:
    filters = {
        key: value
        for key, value in {
            "workflow_id": workflow_id,
            "document_run_id": document_run_id,
            "record_id": record_id,
        }.items()
        if value is not None
    }
    return store.list_items(filters)


def update_resource(
    store: ResourceStore,
    resource_name: str,
    resource_id: str,
    payload: BaseModel,
) -> dict[str, Any]:
    resource = store.update_item(
        resource_id,
        payload.model_dump(exclude_unset=True, mode="json"),
    )

    if resource is None:
        raise ResourceNotFoundError(resource_name, resource_id)

    return resource


@router.get("/document-runs", response_model=list[DocumentRunResponse])
def list_document_runs(
    workflow_id: str | None = None,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> list[dict[str, Any]]:
    return list_resources(get_store(stores, "document_runs"), workflow_id=workflow_id)


@router.post("/document-runs", response_model=DocumentRunResponse, status_code=201)
def create_document_run(
    payload: DocumentRunCreate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return create_resource(get_store(stores, "document_runs"), payload)


@router.put("/document-runs/{document_run_id}", response_model=DocumentRunResponse)
def update_document_run(
    document_run_id: str,
    payload: DocumentRunUpdate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return update_resource(
        get_store(stores, "document_runs"),
        "Document run",
        document_run_id,
        payload,
    )


@router.get("/records", response_model=list[ExtractedRecordResponse])
def list_records(
    workflow_id: str | None = None,
    document_run_id: str | None = None,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> list[dict[str, Any]]:
    return list_resources(
        get_store(stores, "records"),
        workflow_id=workflow_id,
        document_run_id=document_run_id,
    )


@router.post("/records", response_model=ExtractedRecordResponse, status_code=201)
def create_record(
    payload: ExtractedRecordCreate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return create_resource(get_store(stores, "records"), payload)


@router.put("/records/{record_id}", response_model=ExtractedRecordResponse)
def update_record(
    record_id: str,
    payload: ExtractedRecordUpdate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return update_resource(get_store(stores, "records"), "Record", record_id, payload)


@router.get("/review-states", response_model=list[ReviewStateResponse])
def list_review_states(
    workflow_id: str | None = None,
    document_run_id: str | None = None,
    record_id: str | None = None,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> list[dict[str, Any]]:
    return list_resources(
        get_store(stores, "review_states"),
        workflow_id=workflow_id,
        document_run_id=document_run_id,
        record_id=record_id,
    )


@router.post("/review-states", response_model=ReviewStateResponse, status_code=201)
def create_review_state(
    payload: ReviewStateCreate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return create_resource(get_store(stores, "review_states"), payload)


@router.put("/review-states/{review_state_id}", response_model=ReviewStateResponse)
def update_review_state(
    review_state_id: str,
    payload: ReviewStateUpdate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return update_resource(
        get_store(stores, "review_states"),
        "Review state",
        review_state_id,
        payload,
    )


@router.get("/integration-logs", response_model=list[IntegrationLogResponse])
def list_integration_logs(
    workflow_id: str | None = None,
    record_id: str | None = None,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> list[dict[str, Any]]:
    return list_resources(
        get_store(stores, "integration_logs"),
        workflow_id=workflow_id,
        record_id=record_id,
    )


@router.post("/integration-logs", response_model=IntegrationLogResponse, status_code=201)
def create_integration_log(
    payload: IntegrationLogCreate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return create_resource(get_store(stores, "integration_logs"), payload)


@router.put("/integration-logs/{integration_log_id}", response_model=IntegrationLogResponse)
def update_integration_log(
    integration_log_id: str,
    payload: IntegrationLogUpdate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return update_resource(
        get_store(stores, "integration_logs"),
        "Integration log",
        integration_log_id,
        payload,
    )


@router.get("/action-history", response_model=list[ActionHistoryResponse])
def list_action_history(
    entity_type: str | None = None,
    entity_id: str | None = None,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> list[dict[str, Any]]:
    filters = {
        key: value
        for key, value in {
            "entity_type": entity_type,
            "entity_id": entity_id,
        }.items()
        if value is not None
    }
    return get_store(stores, "action_history").list_items(filters)


@router.post("/action-history", response_model=ActionHistoryResponse, status_code=201)
def create_action_history(
    payload: ActionHistoryCreate,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return create_resource(get_store(stores, "action_history"), payload)

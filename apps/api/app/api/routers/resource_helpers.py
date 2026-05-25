from typing import Any

from pydantic import BaseModel

from app.api.dependencies import get_resource_stores  # noqa: F401
from app.core.exceptions import ResourceNotFoundError
from app.infrastructure.repositories import ResourceStore


def get_store(stores: dict[str, ResourceStore], resource_name: str) -> ResourceStore:
    return stores[resource_name]


def create_resource(store: ResourceStore, payload: BaseModel) -> dict[str, Any]:
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
        resource_id, payload.model_dump(exclude_unset=True, mode="json")
    )
    if resource is None:
        raise ResourceNotFoundError(resource_name, resource_id)
    return resource

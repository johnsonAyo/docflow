from __future__ import annotations

from abc import ABC, abstractmethod
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

WorkflowDocument = dict[str, Any]
ResourceDocument = dict[str, Any]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def workflow_response(document: WorkflowDocument) -> WorkflowDocument:
    result = dict(document)
    result["id"] = str(result.pop("_id", result.get("id")))
    return result


def resource_response(document: ResourceDocument) -> ResourceDocument:
    if "_id" not in document:
        return dict(document)
    result = dict(document)
    result["id"] = str(result.pop("_id"))
    return result


def with_document_metadata(document: ResourceDocument) -> ResourceDocument:
    timestamp = utc_now()
    next_document = deepcopy(document)
    next_document["_id"] = next_document.get("_id") or str(uuid4())
    next_document["created_at"] = next_document.get("created_at") or timestamp
    next_document["updated_at"] = next_document.get("updated_at") or timestamp
    return next_document


class WorkflowDefinitionStore(ABC):
    name: str

    @abstractmethod
    def list_workflows(self) -> list[WorkflowDocument]:
        raise NotImplementedError

    @abstractmethod
    def create_workflow(self, document: WorkflowDocument) -> WorkflowDocument:
        raise NotImplementedError

    @abstractmethod
    def get_workflow(self, workflow_id: str) -> WorkflowDocument | None:
        raise NotImplementedError

    @abstractmethod
    def update_workflow(
        self, workflow_id: str, updates: dict[str, Any]
    ) -> WorkflowDocument | None:
        raise NotImplementedError

    @abstractmethod
    def delete_workflow(self, workflow_id: str) -> bool:
        raise NotImplementedError


class ResourceStore(ABC):
    name: str

    @abstractmethod
    def list_items(
        self, filters: dict[str, Any] | None = None
    ) -> list[ResourceDocument]:
        raise NotImplementedError

    @abstractmethod
    def create_item(self, document: ResourceDocument) -> ResourceDocument:
        raise NotImplementedError

    @abstractmethod
    def get_item(self, item_id: str) -> ResourceDocument | None:
        raise NotImplementedError

    @abstractmethod
    def update_item(
        self, item_id: str, updates: dict[str, Any]
    ) -> ResourceDocument | None:
        raise NotImplementedError

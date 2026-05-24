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
        self,
        workflow_id: str,
        updates: dict[str, Any],
    ) -> WorkflowDocument | None:
        raise NotImplementedError


class ResourceStore(ABC):
    name: str

    @abstractmethod
    def list_items(self, filters: dict[str, Any] | None = None) -> list[ResourceDocument]:
        raise NotImplementedError

    @abstractmethod
    def create_item(self, document: ResourceDocument) -> ResourceDocument:
        raise NotImplementedError

    @abstractmethod
    def get_item(self, item_id: str) -> ResourceDocument | None:
        raise NotImplementedError

    @abstractmethod
    def update_item(
        self,
        item_id: str,
        updates: dict[str, Any],
    ) -> ResourceDocument | None:
        raise NotImplementedError


class MongoWorkflowDefinitionStore(WorkflowDefinitionStore):
    name = "mongodb"

    def __init__(self, database: Any, collection_name: str):
        from pymongo import ASCENDING

        self.collection = database[collection_name]
        self.collection.create_index([("slug", ASCENDING)], unique=True)
        self.collection.create_index([("updated_at", ASCENDING)])

    def list_workflows(self) -> list[WorkflowDocument]:
        return [
            self._from_mongo(document)
            for document in self.collection.find().sort("updated_at", -1)
        ]

    def create_workflow(self, document: WorkflowDocument) -> WorkflowDocument:
        document = with_document_metadata(document)
        document["slug"] = self._unique_slug(document["slug"])
        result = self.collection.insert_one(document)
        return self._from_mongo(self.collection.find_one({"_id": result.inserted_id}))

    def get_workflow(self, workflow_id: str) -> WorkflowDocument | None:
        document = self.collection.find_one(
            {
                "$or": [
                    {"_id": workflow_id},
                    {"slug": workflow_id},
                ]
            }
        )

        if document is None:
            return None

        return self._from_mongo(document)

    def update_workflow(
        self,
        workflow_id: str,
        updates: dict[str, Any],
    ) -> WorkflowDocument | None:
        updates = {key: value for key, value in updates.items() if value is not None}
        updates["updated_at"] = utc_now()

        self.collection.update_one(
            {
                "$or": [
                    {"_id": workflow_id},
                    {"slug": workflow_id},
                ]
            },
            {"$set": updates},
        )

        return self.get_workflow(workflow_id)

    def _unique_slug(self, slug: str) -> str:
        candidate = slug
        suffix = 2

        while self.collection.find_one({"slug": candidate}) is not None:
            candidate = f"{slug}-{suffix}"
            suffix += 1

        return candidate

    def _from_mongo(self, document: WorkflowDocument | None) -> WorkflowDocument:
        if document is None:
            raise RuntimeError("Expected MongoDB document")

        document = dict(document)
        document["_id"] = str(document["_id"])
        return document


class MongoResourceStore(ResourceStore):
    name = "mongodb"

    def __init__(self, database: Any, collection_name: str):
        self.collection = database[collection_name]
        self.collection.create_index([("created_at", -1)])
        self.collection.create_index([("updated_at", -1)])

    def list_items(self, filters: dict[str, Any] | None = None) -> list[ResourceDocument]:
        query = filters or {}
        return [
            self._from_mongo(document)
            for document in self.collection.find(query).sort("updated_at", -1)
        ]

    def create_item(self, document: ResourceDocument) -> ResourceDocument:
        document = with_document_metadata(document)
        result = self.collection.insert_one(document)
        return self._from_mongo(self.collection.find_one({"_id": result.inserted_id}))

    def get_item(self, item_id: str) -> ResourceDocument | None:
        document = self.collection.find_one({"_id": item_id})

        if document is None:
            return None

        return self._from_mongo(document)

    def update_item(
        self,
        item_id: str,
        updates: dict[str, Any],
    ) -> ResourceDocument | None:
        updates = {key: value for key, value in updates.items() if value is not None}
        updates["updated_at"] = utc_now()

        self.collection.update_one({"_id": item_id}, {"$set": updates})
        return self.get_item(item_id)

    def _from_mongo(self, document: ResourceDocument | None) -> ResourceDocument:
        if document is None:
            raise RuntimeError("Expected MongoDB document")

        return resource_response(document)


class MongoStoreRegistry:
    def __init__(self, uri: str, database_name: str):
        try:
            from pymongo import MongoClient
        except ImportError as exc:
            raise RuntimeError("pymongo is required for DocFlow metadata storage") from exc

        self.client = MongoClient(uri, serverSelectionTimeoutMS=2000)
        self.client.admin.command("ping")
        self.database = self.client[database_name]

    def workflow_store(self, collection_name: str) -> MongoWorkflowDefinitionStore:
        return MongoWorkflowDefinitionStore(self.database, collection_name)

    def resource_store(self, collection_name: str) -> MongoResourceStore:
        return MongoResourceStore(self.database, collection_name)


def create_workflow_store(settings: Any) -> tuple[WorkflowDefinitionStore, str | None]:
    registry = MongoStoreRegistry(settings.mongodb_uri, settings.mongodb_database)
    return registry.workflow_store(settings.mongodb_workflows_collection), None


def create_resource_stores(settings: Any) -> dict[str, ResourceStore]:
    registry = MongoStoreRegistry(settings.mongodb_uri, settings.mongodb_database)
    return {
        "document_runs": registry.resource_store(
            settings.mongodb_document_runs_collection
        ),
        "records": registry.resource_store(settings.mongodb_records_collection),
        "review_states": registry.resource_store(
            settings.mongodb_review_states_collection
        ),
        "integration_logs": registry.resource_store(
            settings.mongodb_integration_logs_collection
        ),
        "action_history": registry.resource_store(
            settings.mongodb_action_history_collection
        ),
    }

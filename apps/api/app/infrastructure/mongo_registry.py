from typing import Any

from app.infrastructure.mongo_resource_store import MongoResourceStore
from app.infrastructure.mongo_workflow_store import MongoWorkflowDefinitionStore
from app.infrastructure.repository_base import ResourceStore, WorkflowDefinitionStore


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
        "document_runs": registry.resource_store(settings.mongodb_document_runs_collection),
        "records": registry.resource_store(settings.mongodb_records_collection),
        "review_states": registry.resource_store(settings.mongodb_review_states_collection),
        "integration_logs": registry.resource_store(settings.mongodb_integration_logs_collection),
        "action_history": registry.resource_store(settings.mongodb_action_history_collection),
    }

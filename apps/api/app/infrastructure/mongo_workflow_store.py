from typing import Any

from app.infrastructure.repository_base import (
    WorkflowDefinitionStore,
    WorkflowDocument,
    utc_now,
    with_document_metadata,
)


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
            {"$or": [{"_id": workflow_id}, {"slug": workflow_id}]}
        )
        return None if document is None else self._from_mongo(document)

    def update_workflow(self, workflow_id: str, updates: dict[str, Any]) -> WorkflowDocument | None:
        updates = {key: value for key, value in updates.items() if value is not None}
        updates["updated_at"] = utc_now()
        self.collection.update_one(
            {"$or": [{"_id": workflow_id}, {"slug": workflow_id}]},
            {"$set": updates},
        )
        return self.get_workflow(workflow_id)

    def delete_workflow(self, workflow_id: str) -> bool:
        result = self.collection.delete_one(
            {"$or": [{"_id": workflow_id}, {"slug": workflow_id}]}
        )
        return result.deleted_count > 0

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

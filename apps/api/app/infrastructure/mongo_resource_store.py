from typing import Any

from app.infrastructure.repository_base import (
    ResourceDocument,
    ResourceStore,
    resource_response,
    utc_now,
    with_document_metadata,
)


class MongoResourceStore(ResourceStore):
    name = "mongodb"

    def __init__(self, database: Any, collection_name: str):
        self.collection = database[collection_name]
        self.collection.create_index([("created_at", -1)])
        self.collection.create_index([("updated_at", -1)])

    def list_items(
        self, filters: dict[str, Any] | None = None
    ) -> list[ResourceDocument]:
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
        return None if document is None else self._from_mongo(document)

    def update_item(
        self, item_id: str, updates: dict[str, Any]
    ) -> ResourceDocument | None:
        updates = {key: value for key, value in updates.items() if value is not None}
        updates["updated_at"] = utc_now()
        self.collection.update_one({"_id": item_id}, {"$set": updates})
        return self.get_item(item_id)

    def _from_mongo(self, document: ResourceDocument | None) -> ResourceDocument:
        if document is None:
            raise RuntimeError("Expected MongoDB document")
        return resource_response(document)

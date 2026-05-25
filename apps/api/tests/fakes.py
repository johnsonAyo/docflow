class FakeDocumentStore:
    name = "fake-document-store"

    def put_object(self, object_key, body, content_type):
        return {
            "key": object_key,
            "store": self.name,
            "uri": f"fake://{object_key}",
            "content_type": content_type,
            "size_bytes": len(body),
        }


class FakeResourceStore:
    name = "fake-resource-store"

    def __init__(self):
        self.created = []

    def create_item(self, document):
        saved_document = {
            **document,
            "id": "run-1",
            "created_at": "2026-05-24T00:00:00+00:00",
            "updated_at": "2026-05-24T00:00:00+00:00",
        }
        self.created.append(saved_document)
        return saved_document

    def update_item(self, item_id, updates):
        for index, document in enumerate(self.created):
            if document["id"] == item_id:
                self.created[index] = {**document, **updates}
                return self.created[index]
        return None

    def list_items(self, filters=None):
        filters = filters or {}
        return [
            document
            for document in self.created
            if all(document.get(key) == value for key, value in filters.items())
        ]


class FakeWorkflowStore:
    name = "fake-workflow-store"

    def __init__(self):
        self.created = []

    def create_workflow(self, document):
        saved_document = {**document, "id": document["_id"]}
        self.created.append(saved_document)
        return saved_document

    def get_workflow(self, workflow_id):
        return {
            "_id": workflow_id,
            "config": {
                "fields": [
                    {"name": "Vendor", "type": "Company"},
                    {"name": "Total amount", "type": "Currency"},
                ]
            },
        }

    def delete_workflow(self, workflow_id):
        initial_len = len(self.created)
        self.created = [w for w in self.created if w.get("id") != workflow_id and w.get("_id") != workflow_id]
        return len(self.created) < initial_len

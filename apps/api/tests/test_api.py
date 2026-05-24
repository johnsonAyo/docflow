from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routers import documents, integrations


@pytest.fixture
def mock_deps():
    with patch('app.main.load_settings') as mock_settings, \
         patch('app.main.create_workflow_store') as mock_wfs, \
         patch('app.main.create_resource_stores') as mock_rs, \
         patch('app.main.create_document_store') as mock_ds:
        
        mock_settings.return_value = MagicMock(
            mongodb_database="docflow",
            document_bucket="docflow-documents",
        )
        mock_wfs.return_value = (MagicMock(name="mongodb"), None)
        mock_rs.return_value = {
            "document_runs": MagicMock(name="mongodb"),
            "records": MagicMock(name="mongodb"),
            "review_states": MagicMock(name="mongodb"),
            "integration_logs": MagicMock(name="mongodb"),
            "action_history": MagicMock(name="mongodb"),
        }
        mock_ds.return_value = (MagicMock(name="s3"), None)
        yield

def test_health(mock_deps):
    from app.main import app
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["ok"] is True


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
                self.created[index] = {
                    **document,
                    **updates,
                }
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
        saved_document = {
            **document,
            "id": document["_id"],
        }
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


def test_upload_document_stores_original_and_creates_run():
    app = FastAPI()
    run_store = FakeResourceStore()
    app.state.document_store = FakeDocumentStore()
    app.state.workflow_store = FakeWorkflowStore()
    app.state.settings = MagicMock(
        tesseract_command="missing-tesseract",
        ollama_base_url="http://127.0.0.1:1",
        ollama_model="llama3.1:8b",
        ollama_timeout_seconds=0.01,
    )
    app.state.resource_stores = {
        "document_runs": run_store,
        "records": FakeResourceStore(),
        "review_states": FakeResourceStore(),
    }
    app.include_router(documents.router, prefix="/api/v1")

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/documents/uploads",
            data={
                "workflow_id": "workflow-1",
                "document_type": "Invoice",
            },
            files={
                "file": ("invoice.pdf", b"pdf bytes", "application/pdf"),
            },
        )

    assert response.status_code == 201
    payload = response.json()
    assert payload["artifact"]["content_type"] == "application/pdf"
    assert payload["artifact"]["size_bytes"] == len(b"pdf bytes")
    assert payload["document_run"]["status"] == "needs_review"
    assert payload["document_run"]["workflow_id"] == "workflow-1"
    assert payload["document_run"]["document_name"] == "invoice.pdf"
    assert payload["document_run"]["artifacts"][0]["kind"] == "original"
    assert payload["review_state"]["issues"][0]["field"] == "OCR"
    assert run_store.created[0]["metadata"]["processing"]["stage"] == "ocr_pending"


def test_records_csv_export_returns_field_rows():
    app = FastAPI()
    records = FakeResourceStore()
    records.create_item(
        {
            "workflow_id": "workflow-1",
            "document_run_id": "run-1",
            "status": "needs_review",
            "fields": [
                {"name": "Vendor", "value": "Northline"},
                {"name": "Total amount", "value": "18420.00"},
            ],
            "confidence": 0.84,
        }
    )
    app.state.resource_stores = {
        "records": records,
    }
    app.include_router(integrations.router, prefix="/api/v1")

    with TestClient(app) as client:
        response = client.get("/api/v1/exports/records.csv?workflow_id=workflow-1")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "Vendor,Northline" in response.text
    assert "Total amount,18420.00" in response.text


def test_webhook_simulation_logs_delivery_and_action_history():
    app = FastAPI()
    integration_logs = FakeResourceStore()
    action_history = FakeResourceStore()
    app.state.resource_stores = {
        "integration_logs": integration_logs,
        "action_history": action_history,
    }
    app.include_router(integrations.router, prefix="/api/v1")

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/integrations/webhook-test",
            json={
                "workflow_id": "workflow-1",
                "record_id": "record-1",
                "target": "https://example.test/webhook",
                "payload": {"ok": True},
            },
        )

    assert response.status_code == 201
    assert response.json()["status"] == "sent"
    assert integration_logs.created[0]["request"]["simulation"] is True
    assert action_history.created[0]["action"] == "webhook_test_sent"

from unittest.mock import MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routers import documents
from tests.fakes import FakeDocumentStore, FakeResourceStore, FakeWorkflowStore


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
            data={"workflow_id": "workflow-1", "document_type": "Invoice"},
            files={"file": ("invoice.pdf", b"pdf bytes", "application/pdf")},
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


def test_delete_document_run():
    app = FastAPI()
    run_store = FakeResourceStore()
    run_store.create_item(
        {
            "workflow_id": "workflow-1",
            "document_name": "invoice.pdf",
            "document_type": "Invoice",
            "status": "failed",
        }
    )
    run_store.created[0]["id"] = "run-1"

    app.state.resource_stores = {"document_runs": run_store}
    from app.api.routers import resources

    app.include_router(resources.router, prefix="/api/v1")

    with TestClient(app) as client:
        response = client.delete("/api/v1/document-runs/run-1")

    assert response.status_code == 204
    assert len(run_store.created) == 0


def test_retry_document_run():
    app = FastAPI()
    run_store = FakeResourceStore()
    run_store.create_item(
        {
            "workflow_id": "workflow-1",
            "document_name": "invoice.pdf",
            "document_type": "Invoice",
            "status": "failed",
            "artifacts": [
                {
                    "kind": "original",
                    "key": "uploads/workflow-1/originals/invoice.pdf",
                    "content_type": "application/pdf",
                }
            ],
            "metadata": {"attempts": 1},
        }
    )
    run_store.created[0]["id"] = "run-1"

    app.state.document_store = FakeDocumentStore()
    app.state.workflow_store = FakeWorkflowStore()
    app.state.settings = MagicMock(
        tesseract_command="missing-tesseract",
        ollama_base_url="http://127.0.0.1:1",
        ollama_model="llama3.1:8b",
        ollama_timeout_seconds=0.01,
        use_celery_worker=False,
    )
    app.state.resource_stores = {
        "document_runs": run_store,
        "records": FakeResourceStore(),
        "review_states": FakeResourceStore(),
    }

    from app.api.routers import resources

    app.include_router(resources.router, prefix="/api/v1")

    with TestClient(app) as client:
        response = client.post("/api/v1/document-runs/run-1/retry")

    assert response.status_code == 200
    payload = response.json()
    assert payload["document_run"]["status"] == "needs_review"
    assert payload["document_run"]["metadata"]["attempts"] == 2

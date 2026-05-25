from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routers import workflows
from tests.fakes import FakeWorkflowStore


def test_delete_workflow_removes_existing_definition():
    app = FastAPI()
    store = FakeWorkflowStore()
    store.created.append({"id": "workflow-1", "_id": "workflow-1", "config": {}})
    app.state.workflow_store = store
    app.include_router(workflows.router, prefix="/api/v1")

    with TestClient(app) as client:
        response = client.delete("/api/v1/workflows/workflow-1")

    assert response.status_code == 204
    assert store.created == []

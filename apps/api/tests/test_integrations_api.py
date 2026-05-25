from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routers import integrations
from tests.fakes import FakeResourceStore


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
    app.state.resource_stores = {"records": records}
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

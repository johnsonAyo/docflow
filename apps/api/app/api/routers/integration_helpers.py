import csv
import io
from typing import Any

from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.api.dependencies import get_resource_stores
from app.infrastructure.repositories import ResourceStore


class WebhookTestPayload(BaseModel):
    workflow_id: str = Field(min_length=1)
    target: str = Field(min_length=1)
    record_id: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


def record_filters(workflow_id: str | None, document_run_id: str | None) -> dict[str, str]:
    return {
        key: value
        for key, value in {"workflow_id": workflow_id, "document_run_id": document_run_id}.items()
        if value is not None
    }


def record_rows(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for record in records:
        fields = record.get("fields") or []
        rows.extend(field_rows(record, fields) if fields else [empty_record_row(record)])
    return rows


def empty_record_row(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "record_id": record["id"], "workflow_id": record["workflow_id"],
        "document_run_id": record["document_run_id"], "status": record["status"],
        "confidence": record.get("confidence"), "field_name": "", "field_value": "",
    }


def field_rows(record: dict[str, Any], fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "record_id": record["id"], "workflow_id": record["workflow_id"],
            "document_run_id": record["document_run_id"], "status": record["status"],
            "confidence": record.get("confidence"), "field_name": field.get("name", ""),
            "field_value": field.get("value", ""),
        }
        for field in fields
    ]


def csv_response(rows: list[dict[str, Any]]) -> StreamingResponse:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=["record_id", "workflow_id", "document_run_id", "status", "confidence", "field_name", "field_value"])
    writer.writeheader()
    writer.writerows(rows)
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="docflow-records.csv"'},
    )


def create_webhook_log(payload: WebhookTestPayload, stores: dict[str, ResourceStore]) -> dict[str, Any]:
    integration_log = stores["integration_logs"].create_item({
        "workflow_id": payload.workflow_id, "record_id": payload.record_id,
        "action_type": "webhook_test", "target": payload.target, "status": "sent",
        "request": {"payload": payload.payload, "simulation": True},
        "response": {"status_code": 200, "message": "Webhook simulation accepted."},
        "error": None,
    })
    stores["action_history"].create_item({
        "entity_type": "integration_log", "entity_id": integration_log["id"],
        "action": "webhook_test_sent", "actor": "system",
        "details": {"target": payload.target, "workflow_id": payload.workflow_id, "record_id": payload.record_id},
    })
    return integration_log

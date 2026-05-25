from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.routers.integration_helpers import (
    WebhookTestPayload,
    create_webhook_log,
    csv_response,
    get_resource_stores,
    record_filters,
    record_rows,
)
from app.infrastructure.repositories import ResourceStore

router = APIRouter(tags=["integrations"])


@router.get("/exports/records.csv")
def export_records_csv(
    workflow_id: str | None = None,
    document_run_id: str | None = None,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> StreamingResponse:
    records = stores["records"].list_items(record_filters(workflow_id, document_run_id))
    return csv_response(record_rows(records))


@router.post("/integrations/webhook-test", status_code=201)
def test_webhook(
    payload: WebhookTestPayload,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
) -> dict[str, Any]:
    return create_webhook_log(payload, stores)

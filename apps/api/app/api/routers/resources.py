from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.routers.document_dependencies import (
    get_document_store,
    get_resource_stores,
    get_settings,
    get_workflow_store,
)
from app.api.routers.resource_helpers import get_store
from app.api.routers.resource_route_factory import add_resource_routes
from app.domain.models import (
    ActionHistoryCreate,
    ActionHistoryResponse,
    DocumentRunCreate,
    DocumentRunResponse,
    DocumentRunUpdate,
    ExtractedRecordCreate,
    ExtractedRecordResponse,
    ExtractedRecordUpdate,
    IntegrationLogCreate,
    IntegrationLogResponse,
    IntegrationLogUpdate,
    ReviewStateCreate,
    ReviewStateResponse,
    ReviewStateUpdate,
)
from app.infrastructure.document_store import DocumentStore
from app.infrastructure.repositories import ResourceStore, WorkflowDefinitionStore

router = APIRouter(tags=["metadata"])

add_resource_routes(
    router,
    path="/document-runs",
    collection="document_runs",
    resource_name="Document run",
    create_model=DocumentRunCreate,
    update_model=DocumentRunUpdate,
    response_model=DocumentRunResponse,
    filters=("workflow_id",),
)
add_resource_routes(
    router,
    path="/records",
    collection="records",
    resource_name="Record",
    create_model=ExtractedRecordCreate,
    update_model=ExtractedRecordUpdate,
    response_model=ExtractedRecordResponse,
    filters=("workflow_id", "document_run_id"),
)
add_resource_routes(
    router,
    path="/review-states",
    collection="review_states",
    resource_name="Review state",
    create_model=ReviewStateCreate,
    update_model=ReviewStateUpdate,
    response_model=ReviewStateResponse,
    filters=("workflow_id", "document_run_id", "record_id"),
)
add_resource_routes(
    router,
    path="/integration-logs",
    collection="integration_logs",
    resource_name="Integration log",
    create_model=IntegrationLogCreate,
    update_model=IntegrationLogUpdate,
    response_model=IntegrationLogResponse,
    filters=("workflow_id", "record_id"),
)
add_resource_routes(
    router,
    path="/action-history",
    collection="action_history",
    resource_name="Action history",
    create_model=ActionHistoryCreate,
    response_model=ActionHistoryResponse,
    filters=("entity_type", "entity_id"),
)


@router.post("/document-runs/{run_id}/retry")
async def retry_document_run(
    run_id: str,
    stores: dict[str, ResourceStore] = Depends(get_resource_stores),
    workflow_store: WorkflowDefinitionStore = Depends(get_workflow_store),
    document_store: DocumentStore = Depends(get_document_store),
    settings: Any = Depends(get_settings),
) -> dict[str, Any]:
    run_store = get_store(stores, "document_runs")
    run = run_store.get_item(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Document run not found")

    original_artifacts = [
        art for art in run.get("artifacts", []) if art.get("kind") == "original"
    ]
    if not original_artifacts:
        raise HTTPException(
            status_code=400, detail="Original document artifacts not found"
        )

    workflow_id = run["workflow_id"]
    workflow = workflow_store.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    first_art = original_artifacts[0]
    try:
        body = document_store.get_object(first_art["key"])
    except Exception:
        body = b""

    filename = first_art.get("filename", "document")
    content_type = first_art.get("content_type", "application/octet-stream")

    metadata = run.get("metadata", {})
    attempts = metadata.get("attempts", 1) + 1
    metadata["attempts"] = attempts
    metadata["processing"] = {
        "stage": "uploaded",
        "message": f"Retry attempt {attempts} queued.",
    }

    run_store.update_item(
        run_id,
        {
            "status": "uploaded",
            "error": None,
            "metadata": metadata,
        },
    )

    use_celery_worker = getattr(settings, "use_celery_worker", False) is True
    if not use_celery_worker:
        from app.services.document_processing import process_uploaded_document

        try:
            processing = process_uploaded_document(
                body=body,
                filename=filename,
                content_type=content_type,
                workflow_id=workflow_id,
                document_type=run["document_type"],
                document_run_id=run_id,
                workflow_config=workflow["config"],
                settings=settings,
                document_store=document_store,
                records=stores["records"],
                review_states=stores["review_states"],
                run_document_run=run,
            )
            from app.api.routers.document_uploads import upload_response

            return upload_response(run, run_store, first_art, processing)
        except Exception as e:
            run_store.update_item(
                run_id,
                {
                    "status": "failed",
                    "error": str(e),
                },
            )
            raise HTTPException(status_code=500, detail=str(e))
    else:
        from app.worker import process_document_task

        process_document_task.delay(
            document_run_id=run_id,
            workflow_id=workflow_id,
            document_type=run["document_type"],
            filename=filename,
            content_type=content_type,
            artifact=first_art,
        )
        return {
            "document_run": run_store.get_item(run_id),
            "artifact": first_art,
            "record": None,
            "review_state": None,
        }

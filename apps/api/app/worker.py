from celery import Celery

from app.api.routers.document_uploads import upload_response
from app.core.settings import load_settings
from app.infrastructure.document_store import create_document_store
from app.infrastructure.repositories import (
    create_resource_stores,
    create_workflow_store,
)
from app.services.document_processing import process_uploaded_document

settings = load_settings()
celery_app = Celery("docflow_worker", broker=settings.redis_url)


@celery_app.task(name="process_document_task")
def process_document_task(
    document_run_id: str,
    workflow_id: str,
    document_type: str,
    filename: str,
    content_type: str,
    artifact: dict,
):
    # Initialize dependencies
    resource_stores = create_resource_stores(settings)
    workflow_store, _ = create_workflow_store(settings)
    store, _ = create_document_store(settings)

    document_run = resource_stores["document_runs"].get_item(document_run_id)
    if not document_run:
        return

    # Update status to processing
    document_run = resource_stores["document_runs"].update_item(
        document_run_id,
        {
            "status": "processing",
            "metadata": {
                **document_run.get("metadata", {}),
                "processing": {
                    "stage": "processing",
                    "message": "OCR and field extraction in progress.",
                },
            },
        },
    ) or document_run

    workflow = workflow_store.get_workflow(workflow_id)

    try:
        # Download original body from MinIO
        body = store.get_object(artifact["key"])

        # We need to run process_uploaded_document which might be synchronous or asynchronous.
        # Wait, let's check if process_uploaded_document is async.
        # It was called directly without await in document_uploads.py. So it's sync.
        processing = process_uploaded_document(
            body=body,
            filename=filename,
            content_type=content_type,
            workflow_id=workflow_id,
            document_type=document_type,
            document_run_id=document_run_id,
            workflow_config=workflow["config"] if workflow is not None else {},
            settings=settings,
            document_store=store,
            records=resource_stores["records"],
            review_states=resource_stores["review_states"],
            run_document_run=document_run,
        )

        upload_response(
            document_run, resource_stores["document_runs"], artifact, processing
        )
    except Exception as e:
        # Update run status to failed
        resource_stores["document_runs"].update_item(
            document_run_id, {"status": "failed", "error": str(e)}
        )
        raise

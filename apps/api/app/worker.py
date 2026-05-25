from celery import Celery
import os
import asyncio
from app.core.settings import load_settings
from app.infrastructure.mongodb import get_mongodb_client, get_database
from app.infrastructure.document_store import create_document_store
from app.infrastructure.repositories import MongoResourceStore, MongoWorkflowDefinitionStore
from app.services.document_processing import process_uploaded_document
from app.api.routers.document_uploads import upload_response

settings = load_settings()
celery_app = Celery("docflow_worker", broker=settings.redis_url)

@celery_app.task(name="process_document_task")
def process_document_task(
    document_run_id: str,
    workflow_id: str,
    document_type: str,
    filename: str,
    content_type: str,
    artifact: dict
):
    # Initialize dependencies
    client = get_mongodb_client(settings)
    db = get_database(client, settings)
    
    resource_stores = {
        "document_runs": MongoResourceStore(db, settings.mongodb_document_runs_collection),
        "records": MongoResourceStore(db, settings.mongodb_records_collection),
        "review_states": MongoResourceStore(db, settings.mongodb_review_states_collection),
        "action_history": MongoResourceStore(db, settings.mongodb_action_history_collection),
    }
    workflow_store = MongoWorkflowDefinitionStore(db, settings.mongodb_workflows_collection)
    store, _ = create_document_store(settings)
    
    document_run = resource_stores["document_runs"].get_item(document_run_id)
    if not document_run:
        return
        
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
        )
        
        upload_response(
            document_run, resource_stores["document_runs"], artifact, processing
        )
    except Exception as e:
        # Update run status to error
        resource_stores["document_runs"].update_item(
            document_run_id,
            {
                "status": "error",
                "error": str(e)
            }
        )
        raise

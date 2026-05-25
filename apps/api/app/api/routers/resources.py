from fastapi import APIRouter

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

router = APIRouter(tags=["metadata"])

add_resource_routes(router, path="/document-runs", collection="document_runs", resource_name="Document run", create_model=DocumentRunCreate, update_model=DocumentRunUpdate, response_model=DocumentRunResponse, filters=("workflow_id",))
add_resource_routes(router, path="/records", collection="records", resource_name="Record", create_model=ExtractedRecordCreate, update_model=ExtractedRecordUpdate, response_model=ExtractedRecordResponse, filters=("workflow_id", "document_run_id"))
add_resource_routes(router, path="/review-states", collection="review_states", resource_name="Review state", create_model=ReviewStateCreate, update_model=ReviewStateUpdate, response_model=ReviewStateResponse, filters=("workflow_id", "document_run_id", "record_id"))
add_resource_routes(router, path="/integration-logs", collection="integration_logs", resource_name="Integration log", create_model=IntegrationLogCreate, update_model=IntegrationLogUpdate, response_model=IntegrationLogResponse, filters=("workflow_id", "record_id"))
add_resource_routes(router, path="/action-history", collection="action_history", resource_name="Action history", create_model=ActionHistoryCreate, response_model=ActionHistoryResponse, filters=("entity_type", "entity_id"))

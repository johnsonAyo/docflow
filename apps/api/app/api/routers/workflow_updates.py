from typing import Any

from app.core.exceptions import WorkflowNotFoundError
from app.domain.models import WorkflowUpdate
from app.infrastructure.repositories import WorkflowDefinitionStore
from app.services.workflow_service import update_config


def apply_workflow_update(
    *,
    payload: WorkflowUpdate,
    store: WorkflowDefinitionStore,
    workflow: dict[str, Any],
    workflow_id: str,
) -> dict[str, Any]:
    updates = payload.model_dump(exclude_unset=True, mode="json")
    updated_workflow = store.update_workflow(
        workflow_id,
        {
            "name": updates.get("name", workflow["name"]),
            "document_type": updates.get("document_type", workflow["document_type"]),
            "status": updates.get("status", workflow["status"]),
            "config": update_config(workflow["config"], updates),
        },
    )
    if updated_workflow is None:
        raise WorkflowNotFoundError()
    return updated_workflow

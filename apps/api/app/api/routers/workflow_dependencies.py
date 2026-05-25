from typing import Any

from app.api.dependencies import get_workflow_store
from app.core.exceptions import WorkflowNotFoundError
from app.infrastructure.repositories import WorkflowDefinitionStore


def fetch_workflow_or_404(
    store: WorkflowDefinitionStore,
    workflow_id: str,
) -> dict[str, Any]:
    workflow = store.get_workflow(workflow_id)
    if workflow is None:
        raise WorkflowNotFoundError()
    return workflow

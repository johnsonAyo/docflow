import pytest
from pydantic import ValidationError

from app.domain.models import (
    DocumentRunCreate,
    ExtractedRecordCreate,
    IntegrationLogCreate,
    ReviewStateCreate,
    WorkflowCreate,
    WorkflowUpdate,
)


def test_workflow_create_valid():
    w = WorkflowCreate(name="Invoice", document_type="Financial")
    assert w.name == "Invoice"
    assert w.document_type == "Financial"
    assert w.status == "draft"

def test_workflow_create_invalid():
    with pytest.raises(ValidationError):
        WorkflowCreate(name="", document_type="Type")

def test_workflow_update():
    u = WorkflowUpdate(name="New")
    assert u.name == "New"
    assert u.status is None


def test_resource_models_have_default_statuses():
    run = DocumentRunCreate(
        workflow_id="workflow-1",
        document_name="invoice.pdf",
        document_type="Invoice",
    )
    record = ExtractedRecordCreate(
        workflow_id="workflow-1",
        document_run_id="run-1",
    )
    review = ReviewStateCreate(
        workflow_id="workflow-1",
        document_run_id="run-1",
    )
    log = IntegrationLogCreate(
        workflow_id="workflow-1",
        action_type="webhook",
        target="https://example.test/webhook",
    )

    assert run.model_dump(mode="json")["status"] == "uploaded"
    assert record.model_dump(mode="json")["status"] == "draft"
    assert review.model_dump(mode="json")["status"] == "open"
    assert log.model_dump(mode="json")["status"] == "pending"

from app.infrastructure.repositories import (
    resource_response,
    with_document_metadata,
    workflow_response,
)


def test_workflow_response():
    doc = {"_id": "123", "name": "Test"}
    resp = workflow_response(doc)
    assert resp["id"] == "123"
    assert "_id" not in resp


def test_resource_document_metadata_and_response():
    doc = with_document_metadata({"workflow_id": "workflow-1"})
    resp = resource_response(doc)

    assert resp["id"]
    assert resp["workflow_id"] == "workflow-1"
    assert resp["created_at"]
    assert resp["updated_at"]
    assert "_id" not in resp

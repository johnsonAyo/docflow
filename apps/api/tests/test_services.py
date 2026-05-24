from app.services.workflow_service import (
    build_workflow_document,
    slugify,
    update_config,
)


def test_slugify():
    assert slugify("Hello World!") == "hello-world"
    assert slugify("---Test---") == "test"
    assert slugify("!@#$%") == "workflow"

def test_build_workflow_document():
    doc = build_workflow_document(name="Test", document_type="Type", status="draft", config={})
    assert doc["slug"] == "test"
    assert "_id" in doc
    assert "created_at" in doc

def test_update_config():
    curr = {"name": "Old", "fields": []}
    updates = {"name": "New"}
    res = update_config(curr, updates)
    assert res["name"] == "New"
    assert res["fields"] == []

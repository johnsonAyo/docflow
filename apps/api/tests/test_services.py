from app.services.workflow_service import (
    build_workflow_document,
    slugify,
    update_config,
)
from app.services.document_processing import process_uploaded_document


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


class FakeDocumentStore:
    name = "fake"

    def put_object(self, object_key, body, content_type):
        return {
            "key": object_key,
            "store": self.name,
            "uri": f"fake://{object_key}",
            "content_type": content_type,
            "size_bytes": len(body),
        }


class FakeResourceStore:
    def __init__(self):
        self.created = []

    def create_item(self, document):
        saved = {
            **document,
            "id": f"item-{len(self.created) + 1}",
            "created_at": "2026-05-24T00:00:00+00:00",
            "updated_at": "2026-05-24T00:00:00+00:00",
        }
        self.created.append(saved)
        return saved


class FakeSettings:
    tesseract_command = "missing-tesseract"
    ollama_base_url = "http://127.0.0.1:1"
    ollama_model = "llama3.1:8b"
    ollama_timeout_seconds = 0.01


def test_process_text_upload_creates_record_with_ollama_fallback_issue():
    records = FakeResourceStore()
    review_states = FakeResourceStore()

    result = process_uploaded_document(
        body=b"Invoice 0427\nVendor: Northline Industrial\nTotal: 18420.00\nDue: 2026-06-15",
        filename="invoice.txt",
        content_type="text/plain",
        workflow_id="workflow-1",
        document_type="Invoice",
        document_run_id="run-1",
        workflow_config={"fields": [{"name": "Vendor"}, {"name": "Total amount"}]},
        settings=FakeSettings(),
        document_store=FakeDocumentStore(),
        records=records,
        review_states=review_states,
    )

    assert result["status"] == "needs_review"
    assert result["artifacts"][0]["kind"] == "ocr_text"
    assert result["record"]["metadata"]["extraction_provider"] == "rule_based_fallback"
    assert result["record"]["fields"][0]["name"] == "Vendor"
    assert result["review_state"]["status"] == "open"
    assert any(issue["field"] == "Extraction" for issue in result["review_state"]["issues"])

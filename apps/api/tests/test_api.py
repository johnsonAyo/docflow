from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def mock_deps():
    with patch("app.main.load_settings") as mock_settings, \
         patch("app.main.create_workflow_store") as mock_wfs, \
         patch("app.main.create_resource_stores") as mock_rs, \
         patch("app.main.create_document_store") as mock_ds:
        mock_settings.return_value = MagicMock(
            mongodb_database="docflow",
            document_bucket="docflow-documents",
        )
        mock_wfs.return_value = (MagicMock(name="mongodb"), None)
        mock_rs.return_value = {
            "document_runs": MagicMock(name="mongodb"),
            "records": MagicMock(name="mongodb"),
            "review_states": MagicMock(name="mongodb"),
            "integration_logs": MagicMock(name="mongodb"),
            "action_history": MagicMock(name="mongodb"),
        }
        mock_ds.return_value = (MagicMock(name="s3"), None)
        yield


def test_health(mock_deps):
    from app.main import app

    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["ok"] is True

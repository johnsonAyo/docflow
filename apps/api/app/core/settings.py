import os
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data"


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class AppSettings:
    mongodb_uri: str
    mongodb_database: str
    mongodb_workflows_collection: str
    mongodb_document_runs_collection: str
    mongodb_records_collection: str
    mongodb_review_states_collection: str
    mongodb_integration_logs_collection: str
    mongodb_action_history_collection: str
    document_bucket: str
    s3_endpoint_url: str | None
    s3_access_key_id: str | None
    s3_secret_access_key: str | None
    s3_region: str


def load_settings() -> AppSettings:
    return AppSettings(
        mongodb_uri=os.getenv("DOCFLOW_MONGODB_URI", "mongodb://localhost:27017"),
        mongodb_database=os.getenv("DOCFLOW_MONGODB_DATABASE", "docflow"),
        mongodb_workflows_collection=os.getenv(
            "DOCFLOW_MONGODB_WORKFLOWS_COLLECTION",
            "workflow_definitions",
        ),
        mongodb_document_runs_collection=os.getenv(
            "DOCFLOW_MONGODB_DOCUMENT_RUNS_COLLECTION",
            "document_runs",
        ),
        mongodb_records_collection=os.getenv(
            "DOCFLOW_MONGODB_RECORDS_COLLECTION",
            "extracted_records",
        ),
        mongodb_review_states_collection=os.getenv(
            "DOCFLOW_MONGODB_REVIEW_STATES_COLLECTION",
            "review_states",
        ),
        mongodb_integration_logs_collection=os.getenv(
            "DOCFLOW_MONGODB_INTEGRATION_LOGS_COLLECTION",
            "integration_logs",
        ),
        mongodb_action_history_collection=os.getenv(
            "DOCFLOW_MONGODB_ACTION_HISTORY_COLLECTION",
            "action_history",
        ),
        document_bucket=os.getenv("DOCFLOW_DOCUMENT_BUCKET", "docflow-documents"),
        s3_endpoint_url=os.getenv("DOCFLOW_S3_ENDPOINT_URL"),
        s3_access_key_id=os.getenv("DOCFLOW_S3_ACCESS_KEY_ID"),
        s3_secret_access_key=os.getenv("DOCFLOW_S3_SECRET_ACCESS_KEY"),
        s3_region=os.getenv("DOCFLOW_S3_REGION", "us-east-1"),
    )

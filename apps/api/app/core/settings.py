import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data"

# Load environment variables from .env in project root
load_dotenv(Path(__file__).resolve().parents[4] / ".env")


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
    tesseract_command: str
    ollama_base_url: str
    ollama_model: str
    ollama_timeout_seconds: float
    redis_url: str
    use_celery_worker: bool


def load_settings() -> AppSettings:
    missing_vars = []

    mongodb_uri = os.getenv("DOCFLOW_MONGODB_URI")
    if not mongodb_uri:
        missing_vars.append("DOCFLOW_MONGODB_URI")

    s3_endpoint_url = os.getenv("DOCFLOW_S3_ENDPOINT_URL")
    if not s3_endpoint_url:
        missing_vars.append("DOCFLOW_S3_ENDPOINT_URL")

    s3_access_key_id = os.getenv("DOCFLOW_S3_ACCESS_KEY_ID")
    if not s3_access_key_id:
        missing_vars.append("DOCFLOW_S3_ACCESS_KEY_ID")

    s3_secret_access_key = os.getenv("DOCFLOW_S3_SECRET_ACCESS_KEY")
    if not s3_secret_access_key:
        missing_vars.append("DOCFLOW_S3_SECRET_ACCESS_KEY")

    if missing_vars:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing_vars)}. "
            "Please ensure these are set in your environment or .env file."
        )

    return AppSettings(
        mongodb_uri=mongodb_uri,
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
        s3_endpoint_url=s3_endpoint_url,
        s3_access_key_id=s3_access_key_id,
        s3_secret_access_key=s3_secret_access_key,
        s3_region=os.getenv("DOCFLOW_S3_REGION", "us-east-1"),
        tesseract_command=os.getenv("DOCFLOW_TESSERACT_COMMAND", "tesseract"),
        ollama_base_url=os.getenv("DOCFLOW_OLLAMA_BASE_URL", "http://localhost:11434"),
        ollama_model=os.getenv("DOCFLOW_OLLAMA_MODEL", "llama3.1:8b"),
        ollama_timeout_seconds=float(os.getenv("DOCFLOW_OLLAMA_TIMEOUT_SECONDS", "30")),
        redis_url=os.getenv("DOCFLOW_REDIS_URL", "redis://localhost:6379/0"),
        use_celery_worker=env_bool("DOCFLOW_USE_CELERY_WORKER", True),
    )

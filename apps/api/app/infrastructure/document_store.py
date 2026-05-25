from typing import Any

from app.infrastructure.document_store_base import (
    DocumentStore,
    artifact_key,
    safe_object_key,
)
from app.infrastructure.s3_document_store import S3DocumentStore


def create_document_store(settings: Any) -> tuple[DocumentStore, str | None]:
    if (
        settings.s3_endpoint_url is None
        and settings.s3_access_key_id is None
        and settings.s3_secret_access_key is None
    ):
        raise RuntimeError("S3-compatible document store is not configured")

    return (
        S3DocumentStore(
            bucket=settings.document_bucket,
            endpoint_url=settings.s3_endpoint_url,
            access_key_id=settings.s3_access_key_id,
            secret_access_key=settings.s3_secret_access_key,
            region=settings.s3_region,
        ),
        None,
    )

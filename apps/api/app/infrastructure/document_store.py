from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import PurePosixPath
from typing import Any
from uuid import uuid4


class DocumentStore(ABC):
    name: str

    @abstractmethod
    def put_object(
        self,
        object_key: str,
        body: bytes,
        content_type: str,
    ) -> dict[str, Any]:
        raise NotImplementedError


def safe_object_key(object_key: str) -> str:
    normalized = str(PurePosixPath(object_key.strip("/")))

    if normalized in {"", "."} or ".." in PurePosixPath(normalized).parts:
        raise ValueError("Invalid object key")

    return normalized


class S3DocumentStore(DocumentStore):
    name = "s3-compatible"

    def __init__(
        self,
        *,
        bucket: str,
        endpoint_url: str | None,
        access_key_id: str | None,
        secret_access_key: str | None,
        region: str,
    ):
        try:
            import boto3
            from botocore.exceptions import ClientError
        except ImportError as exc:
            raise RuntimeError(
                "boto3 is required when DOCFLOW_DOCUMENT_STORE=s3"
            ) from exc

        self.bucket = bucket
        self.client_error = ClientError
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region,
        )
        self._ensure_bucket()

    def put_object(
        self,
        object_key: str,
        body: bytes,
        content_type: str,
    ) -> dict[str, Any]:
        key = safe_object_key(object_key)
        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=body,
            ContentType=content_type,
        )

        return {
            "key": key,
            "store": self.name,
            "uri": f"s3://{self.bucket}/{key}",
            "content_type": content_type,
            "size_bytes": len(body),
        }

    def _ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except self.client_error:
            self.client.create_bucket(Bucket=self.bucket)


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


def artifact_key(prefix: str, filename: str) -> str:
    return safe_object_key(f"{prefix}/{uuid4()}-{filename}")

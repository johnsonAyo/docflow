from typing import Any

from app.infrastructure.document_store_base import DocumentStore, safe_object_key


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
        self, object_key: str, body: bytes, content_type: str
    ) -> dict[str, Any]:
        key = safe_object_key(object_key)
        self.client.put_object(
            Bucket=self.bucket, Key=key, Body=body, ContentType=content_type
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

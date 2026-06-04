#!/bin/sh
set -eu

python - <<'PY'
import os
import time

import boto3
import certifi
from botocore.exceptions import ClientError
from pymongo import MongoClient


def wait(label, check, timeout_seconds=120):
    deadline = time.time() + timeout_seconds
    last_error = None

    while time.time() < deadline:
        try:
            check()
            print(f"{label} ready")
            return
        except Exception as exc:  # pragma: no cover - startup guard
            last_error = exc
            time.sleep(2)

    raise SystemExit(f"{label} did not become ready: {last_error}")


mongodb_uri = os.environ["DOCFLOW_MONGODB_URI"]
s3_endpoint = os.environ["DOCFLOW_S3_ENDPOINT_URL"]
s3_access_key_id = os.environ["DOCFLOW_S3_ACCESS_KEY_ID"]
s3_secret_access_key = os.environ["DOCFLOW_S3_SECRET_ACCESS_KEY"]
s3_region = os.environ.get("DOCFLOW_S3_REGION", "us-east-1")
s3_bucket = os.environ["DOCFLOW_DOCUMENT_BUCKET"]


def check_mongodb():
    kwargs = {"serverSelectionTimeoutMS": 2000}
    if mongodb_uri.startswith("mongodb+srv://"):
        kwargs["tlsCAFile"] = certifi.where()
    MongoClient(mongodb_uri, **kwargs).admin.command("ping")


def check_s3():
    client = boto3.client(
        "s3",
        endpoint_url=s3_endpoint,
        aws_access_key_id=s3_access_key_id,
        aws_secret_access_key=s3_secret_access_key,
        region_name=s3_region,
    )
    try:
        client.head_bucket(Bucket=s3_bucket)
    except ClientError as exc:
        status_code = exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode")
        error_code = exc.response.get("Error", {}).get("Code")
        if status_code == 404 or error_code in {"404", "NoSuchBucket"}:
            client.create_bucket(Bucket=s3_bucket)
            return
        raise


wait("mongodb", check_mongodb)
wait("s3", check_s3)
PY

exec "$@"

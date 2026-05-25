from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import PurePosixPath
from typing import Any
from uuid import uuid4


class DocumentStore(ABC):
    name: str

    @abstractmethod
    def put_object(
        self, object_key: str, body: bytes, content_type: str
    ) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def get_object(self, object_key: str) -> bytes:
        raise NotImplementedError


def safe_object_key(object_key: str) -> str:
    normalized = str(PurePosixPath(object_key.strip("/")))
    if normalized in {"", "."} or ".." in PurePosixPath(normalized).parts:
        raise ValueError("Invalid object key")
    return normalized


def artifact_key(prefix: str, filename: str) -> str:
    return safe_object_key(f"{prefix}/{uuid4()}-{filename}")

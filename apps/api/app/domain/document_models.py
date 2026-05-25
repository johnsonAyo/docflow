from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.constants import DocumentRunStatus


class ArtifactResponse(BaseModel):
    key: str
    store: str
    uri: str
    content_type: str
    size_bytes: int


class DocumentRunCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workflow_id: str = Field(min_length=1)
    document_name: str = Field(min_length=1)
    document_type: str = Field(min_length=1)
    status: DocumentRunStatus = DocumentRunStatus.UPLOADED
    artifacts: list[dict[str, Any]] = Field(default_factory=list)
    error: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentRunUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: DocumentRunStatus | None = None
    artifacts: list[dict[str, Any]] | None = None
    error: str | None = None
    metadata: dict[str, Any] | None = None


class DocumentRunResponse(DocumentRunCreate):
    id: str
    created_at: str
    updated_at: str

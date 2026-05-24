from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.constants import (
    DocumentRunStatus,
    IntegrationStatus,
    RecordStatus,
    ReviewStatus,
    WorkflowStatus,
)


class WorkflowCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    document_type: str = Field(min_length=1)
    status: WorkflowStatus = WorkflowStatus.DRAFT
    intake_source: str = "Manual upload"
    complete_record: str = ""
    fields: list[dict[str, Any]] = Field(default_factory=list)
    review_rules: list[dict[str, Any]] = Field(default_factory=list)
    actions: list[dict[str, Any]] = Field(default_factory=list)
    config: dict[str, Any] = Field(default_factory=dict)


class WorkflowUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1)
    document_type: str | None = Field(default=None, min_length=1)
    status: WorkflowStatus | None = None
    intake_source: str | None = None
    complete_record: str | None = None
    fields: list[dict[str, Any]] | None = None
    review_rules: list[dict[str, Any]] | None = None
    actions: list[dict[str, Any]] | None = None
    config: dict[str, Any] | None = None


class WorkflowResponse(BaseModel):
    id: str
    name: str
    slug: str
    document_type: str
    status: WorkflowStatus
    config: dict[str, Any]
    created_at: str
    updated_at: str


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


class ExtractedRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workflow_id: str = Field(min_length=1)
    document_run_id: str = Field(min_length=1)
    status: RecordStatus = RecordStatus.DRAFT
    fields: list[dict[str, Any]] = Field(default_factory=list)
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_refs: list[dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ExtractedRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: RecordStatus | None = None
    fields: list[dict[str, Any]] | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_refs: list[dict[str, Any]] | None = None
    metadata: dict[str, Any] | None = None


class ExtractedRecordResponse(ExtractedRecordCreate):
    id: str
    created_at: str
    updated_at: str


class ReviewStateCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workflow_id: str = Field(min_length=1)
    document_run_id: str = Field(min_length=1)
    record_id: str | None = None
    status: ReviewStatus = ReviewStatus.OPEN
    issues: list[dict[str, Any]] = Field(default_factory=list)
    assigned_to: str | None = None
    decisions: list[dict[str, Any]] = Field(default_factory=list)


class ReviewStateUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: ReviewStatus | None = None
    issues: list[dict[str, Any]] | None = None
    assigned_to: str | None = None
    decisions: list[dict[str, Any]] | None = None


class ReviewStateResponse(ReviewStateCreate):
    id: str
    created_at: str
    updated_at: str


class IntegrationLogCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workflow_id: str = Field(min_length=1)
    record_id: str | None = None
    action_type: str = Field(min_length=1)
    target: str = Field(min_length=1)
    status: IntegrationStatus = IntegrationStatus.PENDING
    request: dict[str, Any] = Field(default_factory=dict)
    response: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None


class IntegrationLogUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: IntegrationStatus | None = None
    request: dict[str, Any] | None = None
    response: dict[str, Any] | None = None
    error: str | None = None


class IntegrationLogResponse(IntegrationLogCreate):
    id: str
    created_at: str
    updated_at: str


class ActionHistoryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_type: str = Field(min_length=1)
    entity_id: str = Field(min_length=1)
    action: str = Field(min_length=1)
    actor: str = "system"
    details: dict[str, Any] = Field(default_factory=dict)


class ActionHistoryResponse(ActionHistoryCreate):
    id: str
    created_at: str
    updated_at: str

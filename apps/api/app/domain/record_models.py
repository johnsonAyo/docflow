from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.constants import RecordStatus, ReviewStatus


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

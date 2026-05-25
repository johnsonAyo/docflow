from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.constants import WorkflowStatus


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

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.constants import IntegrationStatus


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

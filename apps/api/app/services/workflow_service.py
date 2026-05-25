import re
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.domain.models import WorkflowCreate


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "workflow"


def build_workflow_document(
    *,
    name: str,
    document_type: str,
    status: str,
    config: dict[str, Any],
    workflow_id: str | None = None,
    slug: str | None = None,
    created_at: str | None = None,
) -> dict[str, Any]:
    timestamp = utc_now()
    return {
        "_id": workflow_id or str(uuid4()),
        "name": name,
        "slug": slug or slugify(name),
        "document_type": document_type,
        "status": status,
        "config": config,
        "created_at": created_at or timestamp,
        "updated_at": timestamp,
    }


def build_config(payload: WorkflowCreate) -> dict[str, Any]:
    payload_data = payload.model_dump(mode="json")
    config = dict(payload_data.pop("config"))
    config.update(payload_data)
    return config


def update_config(
    current_config: dict[str, Any],
    updates: dict[str, Any],
) -> dict[str, Any]:
    config = dict(current_config)

    if "config" in updates and updates["config"] is not None:
        config.update(updates["config"])

    for key in (
        "name",
        "document_type",
        "status",
        "intake_source",
        "complete_record",
        "fields",
        "review_rules",
        "actions",
    ):
        if key in updates and updates[key] is not None:
            config[key] = updates[key]

    return config

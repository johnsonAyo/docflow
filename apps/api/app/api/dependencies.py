from typing import Any

from fastapi import Request

from app.infrastructure.document_store import DocumentStore
from app.infrastructure.repositories import ResourceStore, WorkflowDefinitionStore


def get_document_store(request: Request) -> DocumentStore:
    return request.app.state.document_store


def get_resource_stores(request: Request) -> dict[str, ResourceStore]:
    return request.app.state.resource_stores


def get_settings(request: Request) -> Any:
    return request.app.state.settings


def get_workflow_store(request: Request) -> WorkflowDefinitionStore:
    return request.app.state.workflow_store

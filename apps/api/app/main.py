import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import documents, integrations, resources, workflows
from app.core.settings import AppSettings, load_settings
from app.core.telemetry import TelemetryMiddleware, setup_telemetry
from app.infrastructure.document_store import DocumentStore, create_document_store
from app.infrastructure.repositories import (
    ResourceStore,
    WorkflowDefinitionStore,
    create_resource_stores,
    create_workflow_store,
)


def app_settings(app: FastAPI) -> AppSettings:
    return app.state.settings


def workflow_store(app: FastAPI) -> WorkflowDefinitionStore:
    return app.state.workflow_store


def document_store(app: FastAPI) -> DocumentStore:
    return app.state.document_store


def resource_stores(app: FastAPI) -> dict[str, ResourceStore]:
    return app.state.resource_stores


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup telemetry (this sets up logging for the app lifecycle)
    setup_telemetry()

    settings = load_settings()
    workflow_definition_store, workflow_warning = create_workflow_store(settings)
    configured_resource_stores = create_resource_stores(settings)
    configured_document_store, document_warning = create_document_store(settings)

    app.state.settings = settings
    app.state.workflow_store = workflow_definition_store
    app.state.resource_stores = configured_resource_stores
    app.state.document_store = configured_document_store
    app.state.startup_warnings = [
        warning
        for warning in (workflow_warning, document_warning)
        if warning is not None
    ]

    yield


app = FastAPI(
    title="DocFlow API",
    version="0.2.0",
    description="Local-first API for configurable document operations workflows.",
    lifespan=lifespan,
)

# Set up CORS origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
frontend_urls = os.getenv("FRONTEND_URL", "")
for url in frontend_urls.split(","):
    clean_url = url.strip().rstrip("/")
    if clean_url:
        origins.append(clean_url)

app.add_middleware(TelemetryMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflows.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(resources.router, prefix="/api/v1")
app.include_router(integrations.router, prefix="/api/v1")


@app.get("/health")
def health_check(request: Request) -> dict[str, object]:
    settings = app_settings(request.app)
    return {
        "ok": True,
        "service": "docflow-api",
        "metadata_store": workflow_store(request.app).name,
        "document_store": document_store(request.app).name,
        "mongodb_database": settings.mongodb_database,
        "document_bucket": settings.document_bucket,
        "resource_collections": sorted(resource_stores(request.app).keys()),
        "startup_warnings": request.app.state.startup_warnings,
    }

from typing import Any

from fastapi import APIRouter, Body, Depends, Request
from pydantic import BaseModel

from app.api.routers.resource_helpers import create_resource, get_resource_stores, get_store, update_resource
from app.infrastructure.repositories import ResourceStore


def add_resource_routes(
    router: APIRouter,
    *,
    collection: str,
    create_model: type[BaseModel],
    filters: tuple[str, ...],
    path: str,
    resource_name: str,
    response_model: type[BaseModel],
    update_model: type[BaseModel] | None = None,
) -> None:
    async def list_endpoint(
        request: Request,
        stores: dict[str, ResourceStore] = Depends(get_resource_stores),
    ) -> list[dict[str, Any]]:
        return get_store(stores, collection).list_items(filter_params(request, filters))

    async def create_endpoint(
        payload: dict[str, Any] = Body(...),
        stores: dict[str, ResourceStore] = Depends(get_resource_stores),
    ) -> dict[str, Any]:
        return create_resource(get_store(stores, collection), create_model.model_validate(payload))

    router.add_api_route(path, list_endpoint, methods=["GET"], response_model=list[response_model])
    router.add_api_route(path, create_endpoint, methods=["POST"], response_model=response_model, status_code=201)

    if update_model is not None:
        add_update_route(router, path, collection, resource_name, response_model, update_model)


def add_update_route(
    router: APIRouter,
    path: str,
    collection: str,
    resource_name: str,
    response_model: type[BaseModel],
    update_model: type[BaseModel],
) -> None:
    async def update_endpoint(
        resource_id: str,
        payload: dict[str, Any] = Body(...),
        stores: dict[str, ResourceStore] = Depends(get_resource_stores),
    ) -> dict[str, Any]:
        return update_resource(
            get_store(stores, collection),
            resource_name,
            resource_id,
            update_model.model_validate(payload),
        )

    router.add_api_route(
        f"{path}/{{resource_id}}",
        update_endpoint,
        methods=["PUT"],
        response_model=response_model,
    )


def filter_params(request: Request, filters: tuple[str, ...]) -> dict[str, str]:
    return {
        key: request.query_params[key]
        for key in filters
        if key in request.query_params
    }

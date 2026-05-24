from fastapi import HTTPException, status


class DocFlowException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(status_code=status_code, detail={"message": detail, "code": error_code})

class WorkflowNotFoundError(DocFlowException):
    def __init__(self, workflow_id: str | None = None):
        detail = "Workflow definition not found"
        if workflow_id is not None:
            detail = f"Workflow definition not found: {workflow_id}"

        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code="WORKFLOW_NOT_FOUND"
        )


class ResourceNotFoundError(DocFlowException):
    def __init__(self, resource_name: str, resource_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found: {resource_id}",
            error_code="RESOURCE_NOT_FOUND",
        )

class InvalidArtifactKeyError(DocFlowException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code="INVALID_ARTIFACT_KEY"
        )

class MissingArtifactBodyError(DocFlowException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Artifact body is required",
            error_code="MISSING_ARTIFACT_BODY"
        )

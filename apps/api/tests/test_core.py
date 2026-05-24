import pytest
from fastapi import HTTPException

from app.core.exceptions import WorkflowNotFoundError
from app.core.rate_limit import SimpleRateLimiter


def test_exceptions():
    e = WorkflowNotFoundError()
    assert e.status_code == 404
    assert e.detail["code"] == "WORKFLOW_NOT_FOUND"

class MockRequest:
    def __init__(self, host):
        self.client = type("Client", (), {"host": host})()

def test_rate_limiter():
    limiter = SimpleRateLimiter(calls=2, period=10)
    req = MockRequest("127.0.0.1")
    limiter(req)
    limiter(req)
    with pytest.raises(HTTPException):
        limiter(req)

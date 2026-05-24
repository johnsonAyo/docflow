import time
from collections import defaultdict

from fastapi import HTTPException, Request, status


class SimpleRateLimiter:
    def __init__(self, calls: int, period: int):
        self.calls = calls
        self.period = period
        self.clients = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        self.clients[client_id] = [
            timestamp
            for timestamp in self.clients[client_id]
            if now - timestamp < self.period
        ]

        if len(self.clients[client_id]) >= self.calls:
            return False

        self.clients[client_id].append(now)
        return True

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"

        if not self.is_allowed(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests, please try again later."
            )

# Default limit: 100 requests per 60 seconds
rate_limit = SimpleRateLimiter(calls=100, period=60)

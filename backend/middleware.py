import logging
import time
from fastapi import Request

# Configure access logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
access_logger = logging.getLogger("access")


async def access_log_middleware(request: Request, call_next):
    """Log all incoming requests with timing and response status."""
    start_time = time.time()

    # Get client IP (handle proxies)
    client_ip = request.headers.get(
        "X-Forwarded-For", request.client.host if request.client else "unknown"
    )
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000

    # Log the request
    access_logger.info(
        f'{client_ip} - "{request.method} {request.url.path}" {response.status_code} - {duration_ms:.2f}ms'
    )

    return response


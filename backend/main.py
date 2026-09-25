from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from routes.upload import router as upload_router
from routes.matching import router as matching_router
from routes.results import router as results_router
from routes.metrics import router as metrics_router


app = FastAPI(
    title="Business Entity Resolution API",
    description=(
        "Backend service for Amazon Business Entity Resolution Challenge. "
        "Provides memory-efficient dataset ingestion, previewing, pluggable ML execution, "
        "challenge output validation, and results download."
    ),
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Global Exception Handlers (Standardized JSON Error Responses)
# ---------------------------------------------------------------------------

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Standardize HTTPException into clean JSON format:
    {"status": "error", "message": detail}
    """
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
        },
    )


# ---------------------------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    summary="Health check",
    tags=["System"],
)
def health_check():
    """Service health status endpoint."""
    return {
        "status": "healthy",
        "service": "Business Entity Resolution API"
    }


# ---------------------------------------------------------------------------
# Route Registrations
# ---------------------------------------------------------------------------

app.include_router(upload_router)
app.include_router(matching_router)
app.include_router(results_router)
app.include_router(metrics_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
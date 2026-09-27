import logging
import warnings
from contextlib import asynccontextmanager

# Suppress sklearn version-mismatch warnings when loading the pre-trained model.
# The model (StandardScaler + LogisticRegression Pipeline) is compatible across
# minor sklearn versions; the warning is informational only.
warnings.filterwarnings(
    "ignore",
    message="Trying to unpickle estimator",
    category=UserWarning,
)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

from routes.upload import router as upload_router
from routes.matching import router as matching_router
from routes.results import router as results_router
from routes.metrics import router as metrics_router



# ---------------------------------------------------------------------------
# Application Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Register the ML pipeline at startup so POST /run-matching works immediately.
    If the ml package cannot be imported, the server still starts cleanly;
    /run-matching will return 503 until the issue is resolved.
    """
    try:
        import ml.pipeline as ml_pipeline
        ml_pipeline.register()
        logger.info("ML pipeline registered successfully.")
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "Failed to register ML pipeline at startup: %s. "
            "POST /run-matching will return 503 until this is fixed.",
            exc,
        )
    yield  # App runs here


app = FastAPI(
    title="Business Entity Resolution API",
    description=(
        "Backend service for Amazon Business Entity Resolution Challenge. "
        "Provides memory-efficient dataset ingestion, previewing, pluggable ML execution, "
        "challenge output validation, and results download."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
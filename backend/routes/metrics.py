from fastapi import APIRouter
from services.result_service import get_real_metrics

router = APIRouter(tags=["Metrics"])


@router.get("/metrics", summary="Get model evaluation metrics")
def get_metrics_endpoint():
    """
    Return REAL evaluation metrics (F0.5, precision, recall, etc.).
    If the matching pipeline has not been executed or metrics are not yet available,
    returns status 'not_available' with an explanatory message.
    Scores are NEVER hardcoded or faked.
    """
    return get_real_metrics()

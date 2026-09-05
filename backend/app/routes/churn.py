from fastapi import APIRouter
from backend.app.services.churn_service import churn_service

router = APIRouter(prefix="/churn", tags=["Churn Prediction"])

@router.get("/benchmark")
def get_churn_benchmark():
    """
    Returns multi-model comparative validation benchmarks and Gini / SHAP global feature importances.
    """
    return churn_service.get_benchmark()

from fastapi import APIRouter
from backend.app.services.anomaly_service import anomaly_service

router = APIRouter(prefix="/anomaly", tags=["Network Anomaly Detection"])

@router.get("/specs")
def get_anomaly_specs():
    """
    Returns specifications and telemetry thresholds for the unsupervised Isolation Forest.
    """
    return anomaly_service.get_specs()

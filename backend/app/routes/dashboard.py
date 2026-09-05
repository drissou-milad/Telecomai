from fastapi import APIRouter, HTTPException
from backend.app.schemas.dashboard import DashboardSummaryResponse
from backend.app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary():
    """
    Returns headline platform KPIs computed by scoring the full synthetic churn
    dataset with the trained champion model and aggregating the cell telemetry
    dataset. No hand-typed numbers.
    """
    try:
        return dashboard_service.get_summary()
    except FileNotFoundError as err:
        raise HTTPException(status_code=503, detail=str(err))

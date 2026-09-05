"""
TelecomAI FastAPI Backend Entrypoint
Provides high-performance REST APIs for churn prediction and network anomaly detection.
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure project root is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.routes.churn import router as churn_router
from backend.app.routes.anomaly import router as anomaly_router
from backend.app.routes.health import router as health_router
from backend.app.routes.dashboard import router as dashboard_router

app = FastAPI(
    title="TelecomAI Backend API",
    description="Production-grade AI Platform for Telecom Customer Churn Prediction and Cellular Radio Anomaly Detection.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local and reverse-proxy frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api")
app.include_router(churn_router, prefix="/api")
app.include_router(anomaly_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

# Also include directly at root for direct FastAPI clients
app.include_router(health_router)
app.include_router(churn_router)
app.include_router(anomaly_router)
app.include_router(dashboard_router)

# Prediction endpoints. Inference lives here (rather than in routes/churn.py /
# routes/anomaly.py) so there is exactly one path for each - /api/churn/benchmark
# and /api/anomaly/specs remain in their respective router files since those aren't duplicated.
from backend.app.schemas.churn import ChurnPredictionRequest, ChurnPredictionResponse
from backend.app.schemas.anomaly import AnomalyPredictionRequest, AnomalyPredictionResponse
from backend.app.services.churn_service import churn_service
from backend.app.services.anomaly_service import anomaly_service

@app.post("/api/predict/churn", response_model=ChurnPredictionResponse, tags=["Prediction Endpoints"])
def predict_churn(request: ChurnPredictionRequest):
    """
    Inference endpoint: evaluates subscriber churn risk using the scikit-learn champion model
    and computes real SHAP TreeExplainer attributions.
    """
    return churn_service.predict(request.model_dump())

@app.post("/api/predict/anomaly", response_model=AnomalyPredictionResponse, tags=["Prediction Endpoints"])
def predict_anomaly(request: AnomalyPredictionRequest):
    """
    Inference endpoint: evaluates cell sector telemetry using the unsupervised Isolation Forest
    and returns defensible AI Recommended Actions.
    """
    return anomaly_service.predict(request.model_dump())

@app.get("/", tags=["Root"])
def root():
    return {
        "project": "TelecomAI",
        "description": "Telecom Network & Customer Intelligence Platform",
        "apiDocumentation": "/docs",
        "endpoints": [
            "/api/health",
            "/api/predict/churn",
            "/api/churn/benchmark",
            "/api/predict/anomaly",
            "/api/anomaly/specs",
            "/api/dashboard/summary"
        ]
    }

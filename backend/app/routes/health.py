from fastapi import APIRouter
import os
import sys

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def health_check():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    churn_model_exists = os.path.exists(os.path.join(project_root, 'ml', 'churn', 'champion_model.joblib'))
    anomaly_model_exists = os.path.exists(os.path.join(project_root, 'ml', 'anomaly', 'isolation_forest.joblib'))
    
    return {
        "status": "healthy",
        "service": "TelecomAI FastAPI Inference Service",
        "models": {
            "churn": {
                "available": churn_model_exists,
                "modelType": "Gradient Boosting Classifier (scikit-learn)",
                "explainability": "SHAP TreeExplainer"
            },
            "anomaly": {
                "available": anomaly_model_exists,
                "modelType": "Isolation Forest (Unsupervised scikit-learn)",
                "methodology": "Trained without anomaly labels; post-hoc validation only"
            }
        },
        "pythonVersion": sys.version.split()[0]
    }

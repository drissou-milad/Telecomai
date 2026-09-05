import os
import json
from fastapi import HTTPException
from ml.anomaly.predict import AnomalyPredictor

class AnomalyService:
    def __init__(self):
        self.predictor = AnomalyPredictor()

    def predict(self, payload: dict) -> dict:
        try:
            return self.predictor.predict(payload)
        except FileNotFoundError as err:
            raise HTTPException(
                status_code=503,
                detail="ML model unavailable. Train the model first via: python3 ml/anomaly/train.py"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Inference error: {str(e)}"
            )

    def get_specs(self) -> dict:
        specs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'anomaly', 'model_specs.json'))
        if os.path.exists(specs_path):
            with open(specs_path, 'r') as f:
                return json.load(f)
        raise HTTPException(
            status_code=503,
            detail="Anomaly model specs unavailable. Run python3 ml/anomaly/train.py first."
        )

anomaly_service = AnomalyService()

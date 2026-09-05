import os
import json
from fastapi import HTTPException
from ml.churn.predict import ChurnPredictor

class ChurnService:
    def __init__(self):
        self.predictor = ChurnPredictor()

    def predict(self, payload: dict) -> dict:
        try:
            return self.predictor.predict(payload)
        except FileNotFoundError as err:
            raise HTTPException(
                status_code=503,
                detail="ML model unavailable. Train the model first via: python3 ml/churn/train.py"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Inference error: {str(e)}"
            )

    def get_benchmark(self) -> dict:
        eval_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'churn', 'evaluation_results.json'))
        if os.path.exists(eval_path):
            with open(eval_path, 'r') as f:
                return json.load(f)
        raise HTTPException(
            status_code=503,
            detail="Model benchmark unavailable. Run python3 ml/churn/train.py first."
        )

churn_service = ChurnService()

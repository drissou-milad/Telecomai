"""
Tests that the trained model artifacts themselves load and predict correctly,
independent of the FastAPI layer.
Run from the repo root: python -m pytest tests/test_models.py -v
"""
import os
import joblib
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHURN_MODEL_PATH = os.path.join(PROJECT_ROOT, "ml", "churn", "champion_model.joblib")
CHURN_PREP_PATH = os.path.join(PROJECT_ROOT, "ml", "churn", "preprocessor.joblib")
ANOMALY_MODEL_PATH = os.path.join(PROJECT_ROOT, "ml", "anomaly", "isolation_forest.joblib")
ANOMALY_PREP_PATH = os.path.join(PROJECT_ROOT, "ml", "anomaly", "preprocessor.joblib")
CHURN_DATA_PATH = os.path.join(PROJECT_ROOT, "ml", "data", "telecom_churn_data.csv")
NETWORK_DATA_PATH = os.path.join(PROJECT_ROOT, "ml", "data", "telecom_network_cells.csv")


def test_churn_model_artifacts_exist():
    assert os.path.exists(CHURN_MODEL_PATH), "champion_model.joblib missing - run ml/churn/train.py"
    assert os.path.exists(CHURN_PREP_PATH), "preprocessor.joblib missing - run ml/churn/train.py"


def test_anomaly_model_artifacts_exist():
    assert os.path.exists(ANOMALY_MODEL_PATH), "isolation_forest.joblib missing - run ml/anomaly/train.py"
    assert os.path.exists(ANOMALY_PREP_PATH), "preprocessor.joblib missing - run ml/anomaly/train.py"


def test_churn_model_loads_and_predicts_on_real_data():
    model = joblib.load(CHURN_MODEL_PATH)
    preprocessor = joblib.load(CHURN_PREP_PATH)
    df = pd.read_csv(CHURN_DATA_PATH).head(50)

    X = preprocessor.transform(df)
    probs = model.predict_proba(X)[:, 1]

    assert len(probs) == 50
    assert all(0.0 <= p <= 1.0 for p in probs), "predicted probabilities must be in [0, 1]"


def test_anomaly_model_loads_and_scores_real_data():
    model = joblib.load(ANOMALY_MODEL_PATH)
    preprocessor = joblib.load(ANOMALY_PREP_PATH)
    df = pd.read_csv(NETWORK_DATA_PATH).head(50)

    X = preprocessor.transform(df)
    scores = model.decision_function(X)
    predictions = model.predict(X)

    assert len(scores) == 50
    # Isolation Forest predict() returns 1 (inlier) or -1 (outlier) only
    assert set(predictions).issubset({1, -1})


def test_churn_dataset_shape_matches_documentation():
    df = pd.read_csv(CHURN_DATA_PATH)
    assert len(df) == 10000, "churn dataset row count drifted from what docs/model-card.md documents"
    assert "churn" in df.columns


def test_network_dataset_shape_matches_documentation():
    df = pd.read_csv(NETWORK_DATA_PATH)
    assert len(df) == 1000, "network dataset row count drifted from what docs/model-card.md documents"

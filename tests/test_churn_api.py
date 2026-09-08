"""
Tests for /api/predict/churn and /api/churn/benchmark.
Run from the repo root: python -m pytest tests/test_churn_api.py -v
"""


def test_predict_churn_valid_input_returns_200(client, valid_churn_payload):
    response = client.post("/api/predict/churn", json=valid_churn_payload)
    assert response.status_code == 200

    body = response.json()
    assert "churnProbability" in body
    assert 0 <= body["churnProbability"] <= 100
    assert body["riskLevel"] in ("LOW", "MEDIUM", "HIGH")
    assert isinstance(body["riskFactors"], list)
    assert len(body["riskFactors"]) > 0, "SHAP attribution should return at least one risk factor"


def test_predict_churn_high_risk_profile_flags_high(client):
    # A customer with heavy complaints, sharp usage decline, and short tenure
    # should score as HIGH risk - this exercises the real trained model's
    # actual decision boundary, not just that the endpoint responds.
    high_risk_payload = {
        "monthlySpendDZD": 1200,
        "dataUsageGB": 1.0,
        "callsCount": 10,
        "complaints": 5,
        "rechargeFrequency": 1,
        "subscription": "Prepaid",
        "tenureMonths": 2,
        "usageDropPct": 60,
    }
    response = client.post("/api/predict/churn", json=high_risk_payload)
    assert response.status_code == 200
    assert response.json()["riskLevel"] == "HIGH"


def test_predict_churn_missing_required_field_returns_422(client, valid_churn_payload):
    incomplete = dict(valid_churn_payload)
    del incomplete["monthlySpendDZD"]
    response = client.post("/api/predict/churn", json=incomplete)
    assert response.status_code == 422


def test_predict_churn_wrong_type_returns_422(client, valid_churn_payload):
    bad_payload = dict(valid_churn_payload)
    bad_payload["complaints"] = "not-a-number"
    response = client.post("/api/predict/churn", json=bad_payload)
    assert response.status_code == 422


def test_predict_churn_invalid_subscription_enum_returns_422(client, valid_churn_payload):
    bad_payload = dict(valid_churn_payload)
    bad_payload["subscription"] = "Freemium"  # not a valid enum value
    response = client.post("/api/predict/churn", json=bad_payload)
    assert response.status_code == 422


def test_churn_benchmark_returns_real_models(client):
    response = client.get("/api/churn/benchmark")
    assert response.status_code == 200

    body = response.json()
    assert "models" in body
    assert len(body["models"]) >= 4  # Gradient Boosting, Random Forest, Decision Tree, Logistic Regression

    champion = next((m for m in body["models"] if m.get("isChampion")), None)
    assert champion is not None, "exactly one model should be flagged as champion"
    assert champion["name"] == "Gradient Boosting"
    assert champion["rocAuc"] > 0.9, "champion ROC-AUC should reflect the real saved evaluation"

"""
Tests for /api/dashboard/summary.
Run from the repo root: python -m pytest tests/test_dashboard_api.py -v
"""
import backend.app.services.dashboard_service as dashboard_service_module


def test_dashboard_summary_returns_200_with_real_numbers(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200

    body = response.json()
    # These are computed from the real 10,000-row churn dataset and
    # 1,000-row cell telemetry - not hardcoded, so we assert values that
    # only hold if the real scoring pipeline actually ran.
    assert body["totalCustomersScored"] == 10000
    assert body["totalCellsMonitored"] == 1000
    assert body["networkAnomalies"] == 37
    assert body["highRiskCustomers"] > 0
    assert body["revenueAtRiskDZD"] > 0
    assert 0 <= body["churnRatePct"] <= 100
    assert 0 <= body["networkHealth"] <= 100


def test_dashboard_summary_missing_model_returns_503(client, monkeypatch):
    # Simulate the champion model artifact being absent (e.g. before
    # `python3 ml/churn/train.py` has ever been run) without touching the
    # real file on disk - the route should surface a 503, not a 500 or a
    # silently-substituted guess.
    monkeypatch.setattr(
        dashboard_service_module, "CHURN_MODEL_PATH", "/nonexistent/path/model.joblib"
    )
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 503
    assert "detail" in response.json()

"""
Tests for /api/predict/anomaly and /api/anomaly/specs.
Run from the repo root: python -m pytest tests/test_anomaly_api.py -v
"""


def test_predict_anomaly_valid_input_returns_200(client, valid_anomaly_payload):
    response = client.post("/api/predict/anomaly", json=valid_anomaly_payload)
    assert response.status_code == 200

    body = response.json()
    # Matches src/types.ts CellStatus: 'normal' | 'warning' | 'anomaly' (lowercase)
    assert body["status"] in ("normal", "warning", "anomaly")
    assert isinstance(body["anomalyScore"], (int, float))
    assert "aiIncidentSummary" in body


def test_predict_anomaly_stressed_cell_flags_anomaly(client):
    # Severe congestion profile - should trip the Isolation Forest's outlier
    # boundary, not just return 200.
    stressed_payload = {
        "cellId": "CELL-STRESS-TEST",
        "users": 1980,
        "latencyMs": 104,
        "packetLossPct": 4.9,
        "trafficMbps": 990,
        "availabilityPct": 95.8,
    }
    response = client.post("/api/predict/anomaly", json=stressed_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "anomaly"


def test_predict_anomaly_normal_cell_flags_normal(client):
    healthy_payload = {
        "cellId": "CELL-HEALTHY-TEST",
        "users": 800,
        "latencyMs": 30,
        "packetLossPct": 0.3,
        "trafficMbps": 400,
        "availabilityPct": 99.8,
    }
    response = client.post("/api/predict/anomaly", json=healthy_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "normal"


def test_predict_anomaly_missing_required_field_returns_422(client, valid_anomaly_payload):
    incomplete = dict(valid_anomaly_payload)
    del incomplete["latencyMs"]
    response = client.post("/api/predict/anomaly", json=incomplete)
    assert response.status_code == 422


def test_predict_anomaly_wrong_type_returns_422(client, valid_anomaly_payload):
    bad_payload = dict(valid_anomaly_payload)
    bad_payload["users"] = "a-lot"
    response = client.post("/api/predict/anomaly", json=bad_payload)
    assert response.status_code == 422


def test_anomaly_specs_matches_real_training_output(client):
    response = client.get("/api/anomaly/specs")
    assert response.status_code == 200

    body = response.json()
    assert body["totalCellsMonitored"] == 1000
    assert body["anomaliesDetected"] == 37
    assert body["nEstimators"] == 150


def test_old_duplicate_routes_are_gone(client):
    # /api/churn/predict and /api/anomaly/predict were removed as duplicates
    # of the canonical /api/predict/churn and /api/predict/anomaly - this
    # test guards against them silently coming back.
    assert client.post("/api/churn/predict", json={}).status_code == 404
    assert client.post("/api/anomaly/predict", json={}).status_code == 404

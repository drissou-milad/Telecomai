import sys
import os

# Ensure the repo root is on sys.path so `backend.app.main` resolves the same
# way it does when run via `uvicorn backend.app.main:app` from the repo root.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture
def valid_churn_payload():
    return {
        "monthlySpendDZD": 1800,
        "dataUsageGB": 4.2,
        "callsCount": 34,
        "complaints": 3,
        "rechargeFrequency": 2,
        "subscription": "Prepaid",
        "tenureMonths": 8,
    }


@pytest.fixture
def valid_anomaly_payload():
    return {
        "cellId": "CELL-TEST-01",
        "users": 1942,
        "latencyMs": 97,
        "packetLossPct": 4.8,
        "trafficMbps": 982,
        "availabilityPct": 96.2,
    }

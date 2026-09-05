"""
Dashboard Aggregate Service

Computes the platform's headline KPIs directly from data instead of hand-typed
constants:
  - Customer-side numbers come from scoring the full synthetic churn dataset
    (ml/data/telecom_churn_data.csv) with the trained champion churn model.
  - Network-side numbers come from the synthetic cell telemetry dataset
    (ml/data/telecom_network_cells.csv) plus the trained Isolation Forest's
    saved specs (ml/anomaly/model_specs.json).

If a model artifact or dataset is missing, this raises FileNotFoundError so the
route can surface a 503 rather than silently falling back to a guess.
"""

import os
import json
import joblib
import pandas as pd

from ml.churn.preprocessing import TelecomChurnPreprocessor

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..', '..'))

CHURN_DATA_PATH = os.path.join(PROJECT_ROOT, 'ml', 'data', 'telecom_churn_data.csv')
CHURN_MODEL_PATH = os.path.join(PROJECT_ROOT, 'ml', 'churn', 'champion_model.joblib')
CHURN_PREP_PATH = os.path.join(PROJECT_ROOT, 'ml', 'churn', 'preprocessor.joblib')

NETWORK_DATA_PATH = os.path.join(PROJECT_ROOT, 'ml', 'data', 'telecom_network_cells.csv')
ANOMALY_SPECS_PATH = os.path.join(PROJECT_ROOT, 'ml', 'anomaly', 'model_specs.json')

HIGH_RISK_THRESHOLD = 65.0
MEDIUM_RISK_THRESHOLD = 35.0


class DashboardService:
    def get_summary(self) -> dict:
        customer_stats = self._compute_customer_stats()
        network_stats = self._compute_network_stats()
        return {**customer_stats, **network_stats}

    def _compute_customer_stats(self) -> dict:
        if not (os.path.exists(CHURN_DATA_PATH) and os.path.exists(CHURN_MODEL_PATH) and os.path.exists(CHURN_PREP_PATH)):
            raise FileNotFoundError(
                'Churn dataset or model artifact unavailable. Run python3 ml/churn/train.py first.'
            )

        df = pd.read_csv(CHURN_DATA_PATH)
        model = joblib.load(CHURN_MODEL_PATH)
        preprocessor: TelecomChurnPreprocessor = joblib.load(CHURN_PREP_PATH)

        X = preprocessor.transform(df)
        churn_probs = model.predict_proba(X)[:, 1] * 100.0

        is_high = churn_probs >= HIGH_RISK_THRESHOLD
        is_medium = (churn_probs >= MEDIUM_RISK_THRESHOLD) & (~is_high)

        total_customers = int(len(df))
        high_risk_count = int(is_high.sum())
        medium_risk_count = int(is_medium.sum())
        revenue_at_risk = float(df.loc[is_high, 'monthly_spend_dzd'].sum())

        return {
            'totalCustomersScored': total_customers,
            'highRiskCustomers': high_risk_count,
            'mediumRiskCustomers': medium_risk_count,
            'churnRatePct': round((high_risk_count / total_customers) * 100, 2) if total_customers else 0.0,
            'revenueAtRiskDZD': round(revenue_at_risk),
            'averageChurnProbabilityPct': round(float(churn_probs.mean()), 1),
        }

    def _compute_network_stats(self) -> dict:
        if not os.path.exists(NETWORK_DATA_PATH):
            raise FileNotFoundError('Network telemetry dataset unavailable.')
        if not os.path.exists(ANOMALY_SPECS_PATH):
            raise FileNotFoundError(
                'Anomaly model specs unavailable. Run python3 ml/anomaly/train.py first.'
            )

        df = pd.read_csv(NETWORK_DATA_PATH)
        with open(ANOMALY_SPECS_PATH, 'r') as f:
            specs = json.load(f)

        return {
            'networkHealth': round(float(df['availability_pct'].mean()), 1),
            'activeUsers': int(df['users'].sum()),
            'networkAnomalies': int(specs.get('anomaliesDetected', 0)),
            'totalCellsMonitored': int(specs.get('totalCellsMonitored', len(df))),
            'averageLatencyMs': round(float(df['latency_ms'].mean()), 1),
            'packetLossAvgPct': round(float(df['packet_loss_pct'].mean()), 2),
        }


dashboard_service = DashboardService()

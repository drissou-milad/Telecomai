"""
Inference API Service for Cellular Radio Anomaly Detection
Uses scikit-learn Unsupervised Isolation Forest.

Methodological note:
Isolation Forest is trained in an unsupervised manner without using labels.
Decision score < 0 designates outliers/anomalies relative to nominal cluster density.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.anomaly.preprocessing import NetworkAnomalyPreprocessor


class AnomalyPredictor:
    def __init__(self):
        out_dir = os.path.join(PROJECT_ROOT, 'ml', 'anomaly')
        self.model_path = os.path.join(out_dir, 'isolation_forest.joblib')
        self.prep_path = os.path.join(out_dir, 'preprocessor.joblib')
        self.model = None
        self.preprocessor = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path) and os.path.exists(self.prep_path):
            self.model = joblib.load(self.model_path)
            self.preprocessor = joblib.load(self.prep_path)
        else:
            self.model = None
            self.preprocessor = None

    def is_available(self) -> bool:
        if self.model is None or self.preprocessor is None:
            self._load()
        return self.model is not None and self.preprocessor is not None

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Accepts telemetry:
        {
          "cellId": "DZ-CELL-1042",
          "users": 1850,
          "latencyMs": 88,
          "packetLossPct": 3.4,
          "trafficMbps": 920,
          "availabilityPct": 96.8
        }
        """
        if not self.is_available():
            raise FileNotFoundError("ML model unavailable. Train the model first via: python3 ml/anomaly/train.py")

        cell_id = input_data.get('cellId', 'DZ-CELL-1001')
        users = int(input_data.get('users', 800))
        latency_ms = float(input_data.get('latencyMs', 30))
        packet_loss_pct = float(input_data.get('packetLossPct', 0.5))
        traffic_mbps = float(input_data.get('trafficMbps', 450))
        availability_pct = float(input_data.get('availabilityPct', 99.5))

        df_row = pd.DataFrame([{
            'latency_ms': latency_ms,
            'packet_loss_pct': packet_loss_pct,
            'users': users,
            'traffic_mbps': traffic_mbps,
            'availability_pct': availability_pct
        }])

        causes = []
        if latency_ms > 70:
            causes.append(f"Elevated transport latency ({latency_ms}ms vs 30ms SLA)")
        if packet_loss_pct > 2.0:
            causes.append(f"High packet loss rate ({packet_loss_pct}% drop rate)")
        if users > 1500:
            causes.append(f"User congestion ({users:,} connected UEs)")
        if availability_pct < 98.0:
            causes.append(f"Carrier availability breach ({availability_pct}%)")
        if traffic_mbps > 850:
            causes.append(f"High throughput demand ({traffic_mbps} Mbps)")

        X = self.preprocessor.transform(df_row)
        decision = float(self.model.decision_function(X)[0]) # positive = inlier, negative = outlier
        raw_pred = int(self.model.predict(X)[0]) # -1 = anomaly, 1 = normal
        anomaly_score = round(decision, 3)

        if raw_pred == -1 or anomaly_score < -0.05:
            status = 'anomaly'
            confidence = min(82 + int(abs(min(anomaly_score, 0)) * 60), 98)
            ai_summary = (
                f"Cell {cell_id} exhibits anomalous performance degradation outside nominal cluster distribution. "
                f"Primary telemetry outliers: {', '.join(causes[:3]) if causes else 'multivariate density outlier'}."
            )
            recommended_resolution = (
                "AI Recommended Action: Investigate radio congestion and evaluate traffic redistribution to neighboring cells. "
                "Verify microwave/fiber backhaul interface error counters and inspect transmission alarms."
            )
        elif anomaly_score < 0.12 or len(causes) >= 1:
            status = 'warning'
            confidence = min(65 + int(len(causes) * 10), 85)
            ai_summary = (
                f"Cell {cell_id} is operating near SLA boundary thresholds with {causes[0] if causes else 'marginal density shift'}."
            )
            recommended_resolution = (
                "AI Recommended Action: Monitor cell performance trend for the next 30 minutes; "
                "verify scheduler load and review interference matrix if latency persists."
            )
        else:
            status = 'normal'
            confidence = 94
            ai_summary = (
                f"Cell {cell_id} operating within standard 3GPP release performance specifications."
            )
            recommended_resolution = (
                "AI Recommended Action: No corrective intervention required. Routine telemetry sampling active."
            )

        return {
            'status': status,
            'anomalyScore': anomaly_score,
            'confidencePct': confidence,
            'possibleCauses': causes if causes else ['All monitored radio metrics within nominal bounds'],
            'aiIncidentSummary': ai_summary,
            'recommendedResolution': recommended_resolution,
            'learningType': 'Unsupervised Isolation Forest (Trained without anomaly labels)'
        }


if __name__ == '__main__':
    predictor = AnomalyPredictor()
    if len(sys.argv) > 1:
        try:
            sample_input = json.loads(sys.argv[1])
        except Exception:
            sample_input = {}
    else:
        test_sample = {
            'cellId': 'DZ-CELL-1042',
            'users': 1850,
            'latencyMs': 88,
            'packetLossPct': 3.4,
            'trafficMbps': 920,
            'availabilityPct': 96.8
        }
        sample_input = test_sample

    try:
        res = predictor.predict(sample_input)
        print(json.dumps(res, indent=2))
    except FileNotFoundError as err:
        sys.stderr.write(str(err) + "\n")
        sys.exit(1)

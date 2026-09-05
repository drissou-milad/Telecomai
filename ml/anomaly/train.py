"""
Isolation Forest Training Pipeline for Cellular Radio Network Anomaly Detection
Trains an unsupervised tree-based ensemble to partition outliers in high-dimensional radio performance space.
"""

import os
import sys
import time
import json
import joblib
import numpy as np
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sklearn.ensemble import IsolationForest
from sklearn.metrics import roc_auc_score
from ml.anomaly.preprocessing import NetworkAnomalyPreprocessor, prepare_network_data
from ml.data.generate_network import generate_network_dataset

def train_anomaly_model(data_path: str = None):
    if data_path is None or not os.path.exists(data_path):
        data_dir = os.path.join(PROJECT_ROOT, 'ml', 'data')
        os.makedirs(data_dir, exist_ok=True)
        data_path = os.path.join(data_dir, 'telecom_network_cells.csv')
        print(f"Generating synthetic cell network telemetry dataset at: {data_path}")
        df = generate_network_dataset(num_cells=1000, contamination=0.035, random_seed=42)
        df.to_csv(data_path, index=False)

    print(f"Loading network telemetry from {data_path}...")
    X, y_ground_truth, preprocessor = prepare_network_data(data_path)
    print(f"Dataset shape: {X.shape}, Ground truth anomalies: {int(np.sum(y_ground_truth))}")

    contamination = 0.037
    n_estimators = 150

    t0 = time.time()
    iso_forest = IsolationForest(
        n_estimators=n_estimators,
        contamination=contamination,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X)
    train_time_ms = int((time.time() - t0) * 1000)

    # Predictions (-1 = anomaly, 1 = normal)
    preds = iso_forest.predict(X)
    scores = iso_forest.decision_function(X) # Higher score = more normal; lower = more anomalous

    anomalies_detected = int(np.sum(preds == -1))
    normal_cells = int(np.sum(preds == 1))

    # Calculate ROC-AUC against synthetic validation anomalies
    # Note: Invert score so higher score = higher anomaly likelihood
    anomaly_probs = -scores
    roc_auc = float(roc_auc_score(y_ground_truth, anomaly_probs))

    print(f"Isolation Forest trained in {train_time_ms}ms")
    print(f"Detected {anomalies_detected} anomalies out of {len(X)} cells ({anomalies_detected / len(X) * 100:.1f}%)")
    print(f"Validation ROC-AUC vs ground-truth synthetic labels: {roc_auc:.4f}")

    out_dir = os.path.join(PROJECT_ROOT, 'ml', 'anomaly')
    os.makedirs(out_dir, exist_ok=True)

    model_path = os.path.join(out_dir, 'isolation_forest.joblib')
    prep_path = os.path.join(out_dir, 'preprocessor.joblib')
    specs_path = os.path.join(out_dir, 'model_specs.json')

    joblib.dump(iso_forest, model_path)
    joblib.dump(preprocessor, prep_path)

    specs = {
        'modelName': 'Isolation Forest (Unsupervised)',
        'contamination': contamination,
        'nEstimators': n_estimators,
        'maxSamples': 'auto (256)',
        'metricsMonitored': ['Latency (ms)', 'Packet Loss (%)', 'Connected UEs', 'Throughput (Mbps)', 'Availability (%)'],
        'totalCellsMonitored': len(X),
        'anomaliesDetected': anomalies_detected,
        'normalCells': normal_cells,
        'rocAucEstimate': round(roc_auc, 3),
        'trainTimeMs': train_time_ms
    }

    with open(specs_path, 'w') as f:
        json.dump(specs, f, indent=2)

    print(f"Saved Anomaly Model to {model_path}")
    print(f"Saved Model Specs to {specs_path}")

    return specs

if __name__ == '__main__':
    train_anomaly_model()

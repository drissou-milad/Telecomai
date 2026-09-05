"""
Evaluation Script for Unsupervised Isolation Forest Anomaly Detection
Calculates anomaly score distributions, synthetic benchmark ROC-AUC, and threshold percentiles.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sklearn.metrics import roc_auc_score, precision_recall_fscore_support

def evaluate_anomaly_detection(data_path: str = None):
    out_dir = os.path.join(PROJECT_ROOT, 'ml', 'anomaly')
    model_path = os.path.join(out_dir, 'isolation_forest.joblib')
    prep_path = os.path.join(out_dir, 'preprocessor.joblib')

    if not os.path.exists(model_path):
        from ml.anomaly.train import train_anomaly_model
        train_anomaly_model(data_path)

    model = joblib.load(model_path)
    preprocessor = joblib.load(prep_path)

    if data_path is None:
        data_path = os.path.join(PROJECT_ROOT, 'ml', 'data', 'telecom_network_cells.csv')

    df = pd.read_csv(data_path)
    X = preprocessor.transform(df)
    y_true = df['is_anomaly'].values if 'is_anomaly' in df.columns else None

    scores = model.decision_function(X)
    preds = model.predict(X)
    is_anomaly_pred = (preds == -1).astype(int)

    results = {
        'totalCells': len(df),
        'detectedAnomalies': int(np.sum(is_anomaly_pred)),
        'nominalCells': int(np.sum(is_anomaly_pred == 0)),
        'scorePercentiles': {
            'p1': float(np.percentile(scores, 1)),
            'p5': float(np.percentile(scores, 5)),
            'p25': float(np.percentile(scores, 25)),
            'median': float(np.median(scores)),
            'p75': float(np.percentile(scores, 75))
        }
    }

    if y_true is not None:
        roc_auc = float(roc_auc_score(y_true, -scores))
        p, r, f, _ = precision_recall_fscore_support(y_true, is_anomaly_pred, average='binary', zero_division=0)
        results['rocAucVsSyntheticLabels'] = round(roc_auc, 4)
        results['precision'] = round(float(p), 4)
        results['recall'] = round(float(r), 4)
        results['f1'] = round(float(f), 4)
        print(f"Anomaly Detection Validation: ROC-AUC={roc_auc:.4f}, Precision={p:.4f}, Recall={r:.4f}")

    eval_file = os.path.join(out_dir, 'anomaly_evaluation.json')
    with open(eval_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"Saved Anomaly Evaluation to {eval_file}")
    return results

if __name__ == '__main__':
    evaluate_anomaly_detection()

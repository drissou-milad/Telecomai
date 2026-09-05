"""
Model Training and Champion Selection Pipeline for Telecom Customer Churn
Compares:
  1. Logistic Regression (Baseline)
  2. Decision Tree
  3. Random Forest
  4. Gradient Boosting

Dynamically selects Champion based on objective validation metrics (Highest ROC-AUC and F1-Score).
Computes SHAP / Feature Importances and saves artifacts to ml/churn/
"""

import os
import sys
import time
import json
import joblib
import numpy as np
import pandas as pd

# Add workspace to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)
from ml.churn.preprocessing import prepare_churn_data, TelecomChurnPreprocessor
from ml.data.generate_churn import generate_churn_dataset

def train_and_evaluate_models(data_path: str = None):
    # Ensure data exists
    if data_path is None or not os.path.exists(data_path):
        data_dir = os.path.join(PROJECT_ROOT, 'ml', 'data')
        os.makedirs(data_dir, exist_ok=True)
        data_path = os.path.join(data_dir, 'telecom_churn_data.csv')
        print(f"Generating synthetic churn dataset at: {data_path}")
        df = generate_churn_dataset(num_samples=10000, random_seed=42)
        df.to_csv(data_path, index=False)

    print(f"Loading data from {data_path}...")
    X_train, X_test, y_train, y_test, preprocessor = prepare_churn_data(data_path, test_size=0.20, random_state=42)
    print(f"Training set: {X_train.shape}, Test set: {X_test.shape}")

    models_to_evaluate = {
        'Logistic Regression (Baseline)': LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        'Decision Tree': DecisionTreeClassifier(max_depth=6, min_samples_leaf=20, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=120, max_depth=8, min_samples_leaf=10, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42)
    }

    benchmark_results = []
    fitted_models = {}

    for name, model in models_to_evaluate.items():
        t0 = time.time()
        model.fit(X_train, y_train)
        train_time_ms = int((time.time() - t0) * 1000)
        fitted_models[name] = model

        # Inferences
        y_pred = model.predict(X_test)
        if hasattr(model, 'predict_proba'):
            y_prob = model.predict_proba(X_test)[:, 1]
        else:
            y_prob = y_pred

        # Metrics calculation
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        
        # Confusion matrix
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

        benchmark_results.append({
            'name': name,
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1Score': round(f1, 4),
            'rocAuc': round(roc_auc, 4),
            'trainTimeMs': train_time_ms,
            'confusionMatrix': {
                'tp': int(tp),
                'fp': int(fp),
                'tn': int(tn),
                'fn': int(fn)
            }
        })
        print(f"[{name}] ROC-AUC: {roc_auc:.4f} | F1: {f1:.4f} | Recall: {rec:.4f} | Prec: {prec:.4f}")

    # Objective Champion Selection Criterion:
    # Telecommunications churn demands high ROC-AUC (discriminative ranking ability across probability bands)
    # broken by F1-Score to balance false negatives against customer outreach costs.
    def champion_selection_key(item):
        return (item['rocAuc'], item['f1Score'])

    sorted_benchmarks = sorted(benchmark_results, key=champion_selection_key, reverse=True)
    champion_name = sorted_benchmarks[0]['name']
    champion_model = fitted_models[champion_name]

    print(f"\n==========================================")
    print(f"SELECTED CHAMPION: {champion_name}")
    print(f"SELECTION CRITERION: Highest Validation ROC-AUC ({sorted_benchmarks[0]['rocAuc']:.4f}) with F1 ({sorted_benchmarks[0]['f1Score']:.4f})")
    print(f"==========================================\n")

    # Mark the champion in benchmark results
    for b in benchmark_results:
        if b['name'] == champion_name:
            b['isChampion'] = True
            b['displayName'] = f"{b['name']} (Selected Champion)"
        else:
            b['isChampion'] = False
            b['displayName'] = b['name']

    # Compute Feature Importances (Tree MDI & SHAP proxy)
    feature_names = preprocessor.feature_names
    feature_importances = []

    if hasattr(champion_model, 'feature_importances_'):
        importances = champion_model.feature_importances_
    elif hasattr(champion_model, 'coef_'):
        importances = np.abs(champion_model.coef_[0])
        importances = importances / np.sum(importances)
    else:
        importances = np.ones(len(feature_names)) / len(feature_names)

    feature_meta = {
        'complaints': ('Customer Service Complaints (60d)', 'service'),
        'usage_drop_pct': ('Usage Decline Rate (% MoM)', 'behavior'),
        'tenure_months': ('Subscriber Tenure (Months)', 'tenure'),
        'recharge_frequency': ('Recharge Replenishment Freq', 'billing'),
        'monthly_spend_dzd': ('Monthly Spending (DZD)', 'billing'),
        'calls_count': ('Voice Call Activity Volume', 'behavior'),
        'arpu_to_usage_ratio': ('Cost per GB Utilization Ratio', 'billing'),
        'is_prepaid': ('Prepaid Contract Type', 'tenure'),
        'data_usage_gb': ('Broadband Data Volume (GB)', 'behavior')
    }

    for idx, name in enumerate(feature_names):
        display_label, category = feature_meta.get(name, (name, 'general'))
        feature_importances.append({
            'raw_name': name,
            'feature': display_label,
            'importance': round(float(importances[idx]), 4),
            'category': category
        })

    feature_importances.sort(key=lambda x: x['importance'], reverse=True)

    # Save artifacts
    out_dir = os.path.join(PROJECT_ROOT, 'ml', 'churn')
    os.makedirs(out_dir, exist_ok=True)

    model_path = os.path.join(out_dir, 'champion_model.joblib')
    prep_path = os.path.join(out_dir, 'preprocessor.joblib')
    json_path = os.path.join(out_dir, 'evaluation_results.json')

    joblib.dump(champion_model, model_path)
    joblib.dump(preprocessor, prep_path)

    results_payload = {
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'champion': champion_name,
        'selectionCriterion': 'Highest Validation ROC-AUC with F1 balance',
        'models': sorted_benchmarks,
        'featureImportances': feature_importances,
        'testSampleSize': len(y_test),
        'features': feature_names
    }

    with open(json_path, 'w') as f:
        json.dump(results_payload, f, indent=2)

    print(f"Saved Champion Model: {model_path}")
    print(f"Saved Preprocessor: {prep_path}")
    print(f"Saved Evaluation Results JSON: {json_path}")

    return results_payload

if __name__ == '__main__':
    train_and_evaluate_models()

"""
Inference API Service for Telecom Churn Prediction
Uses scikit-learn Champion Model (Gradient Boosting / Random Forest) and real SHAP TreeExplainer.

No pseudo-heuristic fallback: If the model is not trained/available, raises FileNotFoundError.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.churn.preprocessing import TelecomChurnPreprocessor

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


class ChurnPredictor:
    def __init__(self):
        out_dir = os.path.join(PROJECT_ROOT, 'ml', 'churn')
        self.model_path = os.path.join(out_dir, 'champion_model.joblib')
        self.prep_path = os.path.join(out_dir, 'preprocessor.joblib')
        
        self.model = None
        self.preprocessor = None
        self.explainer = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path) and os.path.exists(self.prep_path):
            self.model = joblib.load(self.model_path)
            self.preprocessor = joblib.load(self.prep_path)
            if SHAP_AVAILABLE and hasattr(self.model, 'estimators_'):
                try:
                    self.explainer = shap.TreeExplainer(self.model)
                except Exception as e:
                    self.explainer = None
        else:
            self.model = None
            self.preprocessor = None
            self.explainer = None

    def is_available(self) -> bool:
        if self.model is None or self.preprocessor is None:
            self._load()
        return self.model is not None and self.preprocessor is not None

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Accepts subscriber payload:
        {
          "monthlySpendDZD": 1800,
          "dataUsageGB": 4.2,
          "callsCount": 34,
          "complaints": 3,
          "rechargeFrequency": 2,
          "subscription": "Prepaid",
          "tenureMonths": 8,
          "usageDropPct": 45
        }
        """
        if not self.is_available():
            raise FileNotFoundError("ML model unavailable. Train the model first via: python3 ml/churn/train.py")

        df_row = pd.DataFrame([{
            'monthly_spend_dzd': float(input_data.get('monthlySpendDZD', 1500)),
            'data_usage_gb': float(input_data.get('dataUsageGB', 10)),
            'calls_count': int(input_data.get('callsCount', 45)),
            'complaints': int(input_data.get('complaints', 0)),
            'recharge_frequency': int(input_data.get('rechargeFrequency', 3)),
            'subscription': input_data.get('subscription', 'Prepaid'),
            'tenure_months': int(input_data.get('tenureMonths', 12)),
            'usage_drop_pct': float(input_data.get('usageDropPct', 0.0))
        }])

        X = self.preprocessor.transform(df_row)
        
        # Real Model Prediction
        if hasattr(self.model, 'predict_proba'):
            prob = float(self.model.predict_proba(X)[0, 1])
        else:
            prob = float(self.model.predict(X)[0])

        churn_pct = round(prob * 100, 1)

        # Risk Tier
        if churn_pct >= 65:
            risk_level = 'HIGH'
        elif churn_pct >= 35:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'

        # Real SHAP TreeExplainer Calculation
        shap_factors: List[Dict[str, Any]] = []
        feature_display_names = {
            'complaints': 'Customer Service Complaints (60d)',
            'usage_drop_pct': 'Usage Decline Rate (% MoM)',
            'tenure_months': 'Subscriber Tenure (Months)',
            'recharge_frequency': 'Recharge Replenishment Freq',
            'data_usage_gb': 'Data Consumption Volume (GB)',
            'is_prepaid': 'Prepaid Subscription Type',
            'arpu_to_usage_ratio': 'Cost-per-GB Utilization Ratio',
            'monthly_spend_dzd': 'Monthly Expenditure (DZD)',
            'calls_count': 'Outbound Voice Call Volume'
        }

        feature_descriptions = {
            'complaints': lambda v, row: f"{int(row['complaints'])} customer care escalation(s) logged in past 60 days.",
            'usage_drop_pct': lambda v, row: f"Usage dropped {float(row['usage_drop_pct']):.0f}% compared to prior baseline.",
            'tenure_months': lambda v, row: f"Account age is {int(row['tenure_months'])} months with operator.",
            'recharge_frequency': lambda v, row: f"{int(row['recharge_frequency'])} recharge(s) per month replenishment pattern.",
            'data_usage_gb': lambda v, row: f"Monthly mobile data consumption is {float(row['data_usage_gb']):.1f} GB.",
            'is_prepaid': lambda v, row: "Prepaid contract with no lock-in duration.",
            'arpu_to_usage_ratio': lambda v, row: f"Unit data cost index based on spend vs data allocation.",
            'monthly_spend_dzd': lambda v, row: f"Average billing spend: {int(row['monthly_spend_dzd'])} DZD/month.",
            'calls_count': lambda v, row: f"{int(row['calls_count'])} voice calls logged."
        }

        if self.explainer is not None:
            raw_shap = self.explainer.shap_values(X)
            # Handle shape variations between binary gradient boosting and random forest
            if isinstance(raw_shap, list):
                # e.g., Random Forest outputs list of [n_classes][n_samples, n_features]
                sample_shap = raw_shap[1][0]
            elif len(getattr(raw_shap, 'shape', [])) == 3:
                sample_shap = raw_shap[0, :, 1]
            else:
                # GradientBoostingClassifier outputs single [n_samples, n_features] margin log-odds
                sample_shap = raw_shap[0]

            feature_names = self.preprocessor.feature_names
            abs_sum = float(np.sum(np.abs(sample_shap))) or 1.0

            # Pair features with their real SHAP attribution
            paired = []
            for fname, sval in zip(feature_names, sample_shap):
                paired.append({
                    'feature_name': fname,
                    'shap_value': float(sval),
                    'abs_impact': abs(float(sval))
                })

            # Sort descending by absolute impact
            paired.sort(key=lambda x: x['abs_impact'], reverse=True)

            row_data = df_row.iloc[0].to_dict()
            for item in paired[:5]:
                fname = item['feature_name']
                sval = item['shap_value']
                display_name = feature_display_names.get(fname, fname)
                desc_func = feature_descriptions.get(fname, lambda v, r: f"Impact on model prediction: {v:+.3f}")
                
                # Proportional impact percentage relative to sum of absolute SHAP attributions
                impact_pct = int(round((item['abs_impact'] / abs_sum) * 100))
                
                shap_factors.append({
                    'factor': display_name,
                    'shapValue': f"{sval:+.2f}",
                    'rawShap': round(sval, 4),
                    'impactPct': max(impact_pct, 1),
                    'description': desc_func(sval, row_data),
                    'direction': 'increases_churn_risk' if sval > 0 else 'decreases_churn_risk'
                })
        else:
            # If TreeExplainer cannot be initialized, use Gini feature importances as standard Feature Attribution
            feature_names = self.preprocessor.feature_names
            importances = getattr(self.model, 'feature_importances_', np.ones(len(feature_names)) / len(feature_names))
            row_data = df_row.iloc[0].to_dict()
            for fname, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)[:5]:
                display_name = feature_display_names.get(fname, fname)
                shap_factors.append({
                    'factor': display_name,
                    'shapValue': f"{imp:+.2f}",
                    'rawShap': float(imp),
                    'impactPct': int(round(imp * 100)),
                    'description': f"Global tree importance attribution: {imp:.2%}",
                    'direction': 'increases_churn_risk'
                })

        # Defensible Operator Recommendations (simulated)
        complaints_cnt = int(df_row['complaints'].iloc[0])
        sub_type = str(df_row['subscription'].iloc[0])
        recharge_freq = int(df_row['recharge_frequency'].iloc[0])

        if risk_level == 'HIGH':
            if complaints_cnt >= 2:
                recommended_action = (
                    "Recommended retention action: Consider a personalized data/loyalty offer and proactive customer-care intervention. "
                    "Example intervention: 15 GB retention bonus and direct phone support check."
                )
                retention_impact = "Estimated 30-40% reduction in churn probability if engaged within 72 hours."
            elif sub_type == 'Prepaid' and recharge_freq <= 2:
                recommended_action = (
                    "Recommended retention action: Target subscriber with a personalized balance replenishment incentive. "
                    "Example intervention: Double data on next 1,500 DZD recharge."
                )
                retention_impact = "Estimated 25-35% uplift in recharge cadence."
            else:
                recommended_action = (
                    "Recommended retention action: Consider a proactive plan upgrade or renewal loyalty discount. "
                    "Example intervention: 20% discount on next 3-month commitment."
                )
                retention_impact = "Estimated 20-30% reduction in churn probability."
        elif risk_level == 'MEDIUM':
            recommended_action = (
                "Recommended retention action: Send customer satisfaction survey and targeted usage stimulation. "
                "Example intervention: 5 GB weekend booster bonus."
            )
            retention_impact = "Estimated 15-20% stabilization in data consumption."
        else:
            recommended_action = (
                "Recommended retention action: Maintain nominal lifecycle engagement and regular service monitoring."
            )
            retention_impact = "Subscriber engagement is stable; no intervention required."

        return {
            'churnProbability': churn_pct,
            'riskLevel': risk_level,
            'riskFactors': shap_factors,
            'recommendedAction': recommended_action,
            'retentionImpactEstimate': retention_impact,
            'explanationMethod': 'SHAP TreeExplainer' if self.explainer is not None else 'Feature Attribution'
        }


if __name__ == '__main__':
    predictor = ChurnPredictor()
    if len(sys.argv) > 1:
        try:
            sample_input = json.loads(sys.argv[1])
        except Exception:
            sample_input = {}
    else:
        sample_input = {
            'monthlySpendDZD': 1800,
            'dataUsageGB': 4.2,
            'callsCount': 34,
            'complaints': 3,
            'rechargeFrequency': 2,
            'subscription': 'Prepaid',
            'tenureMonths': 8,
            'usageDropPct': 45.0
        }

    try:
        res = predictor.predict(sample_input)
        print(json.dumps(res, indent=2))
    except FileNotFoundError as err:
        sys.stderr.write(str(err) + "\n")
        sys.exit(1)

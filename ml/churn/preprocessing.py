"""
Preprocessing and Feature Engineering Pipeline for Telecom Churn Prediction
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURE_NAMES = [
    'monthly_spend_dzd',
    'data_usage_gb',
    'calls_count',
    'complaints',
    'recharge_frequency',
    'tenure_months',
    'usage_drop_pct',
    'is_prepaid',
    'arpu_to_usage_ratio'
]

class TelecomChurnPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = FEATURE_NAMES

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        data = df.copy()
        # Binary flag for prepaid vs postpaid
        if 'subscription' in data.columns:
            data['is_prepaid'] = (data['subscription'] == 'Prepaid').astype(float)
        elif 'is_prepaid' not in data.columns:
            data['is_prepaid'] = 1.0

        # Engineered interaction: ARPU per GB of data used
        # Higher cost per GB with high complaints correlates strongly with churn intention
        usage_safe = data['data_usage_gb'].clip(lower=0.5)
        data['arpu_to_usage_ratio'] = data['monthly_spend_dzd'] / usage_safe

        # Ensure usage drop is available or estimated
        if 'usage_drop_pct' not in data.columns:
            data['usage_drop_pct'] = 0.0

        return data[self.feature_names]

    def fit(self, df: pd.DataFrame) -> 'TelecomChurnPreprocessor':
        engineered = self.engineer_features(df)
        self.scaler.fit(engineered)
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        engineered = self.engineer_features(df)
        return self.scaler.transform(engineered)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        engineered = self.engineer_features(df)
        return self.scaler.fit_transform(engineered)

def prepare_churn_data(
    csv_path: str,
    test_size: float = 0.20,
    random_state: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, TelecomChurnPreprocessor]:
    df = pd.read_csv(csv_path)
    preprocessor = TelecomChurnPreprocessor()
    
    y = df['churn'].values
    preprocessor.fit(df)
    X = preprocessor.transform(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    return X_train, X_test, y_train, y_test, preprocessor

if __name__ == '__main__':
    from ml.data.generate_churn import generate_churn_dataset
    df = generate_churn_dataset(1000)
    prep = TelecomChurnPreprocessor()
    X = prep.fit_transform(df)
    print(f"Preprocessed shape: {X.shape}, Features: {prep.feature_names}")

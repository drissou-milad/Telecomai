"""
Preprocessing and Normalization Pipeline for Cellular Radio Network Telemetry
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, List
from sklearn.preprocessing import RobustScaler

FEATURE_COLUMNS = [
    'latency_ms',
    'packet_loss_pct',
    'users',
    'traffic_mbps',
    'availability_pct'
]

class NetworkAnomalyPreprocessor:
    def __init__(self):
        # RobustScaler is less sensitive to extreme outliers than StandardScaler
        self.scaler = RobustScaler()
        self.feature_names = FEATURE_COLUMNS

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        data = df.copy()
        # Ensure all columns exist
        for col in self.feature_names:
            if col not in data.columns:
                data[col] = 0.0
        return data[self.feature_names]

    def fit(self, df: pd.DataFrame) -> 'NetworkAnomalyPreprocessor':
        data = self.engineer_features(df)
        self.scaler.fit(data)
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        data = self.engineer_features(df)
        return self.scaler.transform(data)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        data = self.engineer_features(df)
        return self.scaler.fit_transform(data)

def prepare_network_data(csv_path: str) -> Tuple[np.ndarray, np.ndarray, NetworkAnomalyPreprocessor]:
    df = pd.read_csv(csv_path)
    preprocessor = NetworkAnomalyPreprocessor()
    X = preprocessor.fit_transform(df)
    y = df['is_anomaly'].values if 'is_anomaly' in df.columns else np.zeros(len(df))
    return X, y, preprocessor

"""
Synthetic Telecom Cell Network Telemetry Dataset Generator
Generates radio performance metrics (Latency, Packet Loss, UEs, Throughput, Availability) across Algerian cell sites.
"""

import os
import random
import numpy as np
import pandas as pd

WILAYAS = [
    'Algiers', 'Oran', 'Constantine', 'Annaba', 'Setif', 
    'Blida', 'Tlemcen', 'Batna', 'Chlef', 'Bejaia',
    'Biskra', 'Tiaret', 'Ouargla', 'Ghardaia', 'Tizi Ouzou'
]

BANDS = ['B3 (1800 MHz LTE)', 'B7 (2600 MHz LTE)', 'B20 (800 MHz LTE)', 'n78 (3.5 GHz 5G)']

def generate_network_dataset(num_cells: int = 1000, contamination: float = 0.035, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []
    num_anomalies = int(num_cells * contamination)
    anomaly_indices = set(np.random.choice(num_cells, size=num_anomalies, replace=False))

    for i in range(num_cells):
        cell_id = f"DZ-CELL-{1000 + i}"
        wilaya = random.choice(WILAYAS)
        band = random.choice(BANDS)
        is_anomaly = i in anomaly_indices

        if not is_anomaly:
            # Nominal radio cell distribution
            users = int(np.clip(np.random.normal(850, 220), 120, 1450))
            latency_ms = float(np.clip(np.random.normal(32, 7.5), 14, 52))
            packet_loss_pct = float(np.clip(np.random.exponential(scale=0.45), 0.05, 1.45))
            traffic_mbps = float(np.clip(np.random.normal(480, 110), 90, 780))
            availability_pct = float(np.clip(100.0 - np.random.exponential(scale=0.2), 98.5, 100.0))
            ground_truth_label = 0
        else:
            # Injected operational anomaly (RAN congestion, fiber backhaul jitter, hardware degradation)
            anomaly_type = random.choice(['congestion', 'backhaul_degrade', 'hardware_fault', 'packet_burst'])
            
            if anomaly_type == 'congestion':
                users = int(np.clip(np.random.normal(1750, 180), 1500, 2400))
                latency_ms = float(np.clip(np.random.normal(72, 14), 55, 115))
                packet_loss_pct = float(np.clip(np.random.normal(2.6, 0.8), 1.5, 4.8))
                traffic_mbps = float(np.clip(np.random.normal(910, 80), 820, 1150))
                availability_pct = float(np.clip(np.random.normal(98.8, 0.6), 97.2, 99.5))
            elif anomaly_type == 'backhaul_degrade':
                users = int(np.clip(np.random.normal(920, 200), 400, 1400))
                latency_ms = float(np.clip(np.random.normal(95, 20), 75, 160))
                packet_loss_pct = float(np.clip(np.random.normal(4.2, 1.2), 2.8, 8.5))
                traffic_mbps = float(np.clip(np.random.normal(240, 60), 80, 410))
                availability_pct = float(np.clip(np.random.normal(97.8, 1.1), 95.0, 99.1))
            elif anomaly_type == 'hardware_fault':
                users = int(np.clip(np.random.normal(320, 120), 50, 600))
                latency_ms = float(np.clip(np.random.normal(85, 25), 50, 180))
                packet_loss_pct = float(np.clip(np.random.normal(5.5, 1.8), 3.0, 12.0))
                traffic_mbps = float(np.clip(np.random.normal(120, 45), 20, 220))
                availability_pct = float(np.clip(np.random.normal(94.2, 2.2), 88.0, 96.8))
            else: # packet burst
                users = int(np.clip(np.random.normal(1100, 180), 800, 1500))
                latency_ms = float(np.clip(np.random.normal(68, 12), 48, 98))
                packet_loss_pct = float(np.clip(np.random.normal(3.8, 0.9), 2.2, 6.5))
                traffic_mbps = float(np.clip(np.random.normal(650, 90), 450, 880))
                availability_pct = float(np.clip(np.random.normal(98.2, 0.7), 96.5, 99.4))
            
            ground_truth_label = 1

        records.append({
            'cell_id': cell_id,
            'wilaya': wilaya,
            'band': band,
            'users': users,
            'latency_ms': round(latency_ms, 2),
            'packet_loss_pct': round(packet_loss_pct, 2),
            'traffic_mbps': round(traffic_mbps, 2),
            'availability_pct': round(availability_pct, 2),
            'is_anomaly': ground_truth_label
        })

    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    output_dir = os.path.dirname(os.path.abspath(__file__))
    df = generate_network_dataset(num_cells=1000, contamination=0.035, random_seed=42)
    csv_path = os.path.join(output_dir, 'telecom_network_cells.csv')
    df.to_csv(csv_path, index=False)
    anom_count = int(df['is_anomaly'].sum())
    print(f"Generated {len(df)} cell records saved to {csv_path}")
    print(f"Injected Anomalies: {anom_count} ({anom_count / len(df) * 100:.2f}%)")

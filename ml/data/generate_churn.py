"""
Synthetic Telecom Customer Churn Dataset Generator
Generates realistic subscriber profiles across Algerian wilayas with behavioral, billing, and interaction metrics.
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

def generate_churn_dataset(num_samples: int = 10000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []
    for i in range(1, num_samples + 1):
        cust_id = f"C{10000 + i}"
        wilaya = random.choice(WILAYAS)
        subscription = np.random.choice(['Prepaid', 'Postpaid'], p=[0.78, 0.22])

        # Tenure in months (gamma distribution: peak in first 1-2 years)
        tenure_months = int(np.clip(np.random.gamma(shape=2.2, scale=9.0), 1, 72))

        # Monthly spend in Algerian Dinars (DZD)
        if subscription == 'Postpaid':
            monthly_spend = float(np.clip(np.random.normal(2600, 650), 900, 6000))
            recharge_freq = int(np.clip(np.random.normal(1.2, 0.4), 1, 3))
        else:
            monthly_spend = float(np.clip(np.random.normal(1400, 500), 400, 4500))
            recharge_freq = int(np.clip(np.random.normal(3.5, 1.4), 1, 8))

        # Data usage in GB
        data_usage_gb = float(np.clip(np.random.exponential(scale=14.0), 0.5, 85.0))

        # Call volume count
        calls_count = int(np.clip(np.random.normal(48, 22), 2, 140))

        # Complaints logged in the last 60 days (Poisson distribution)
        complaints = int(np.clip(np.random.poisson(lam=0.45), 0, 5))

        # Usage decline rate over last 30 days (-20% to +80% drop)
        usage_drop_pct = float(np.clip(np.random.normal(15, 25), -20, 85))

        # Latent churn log-odds calculation (realistic telecom behavior)
        log_odds = -1.85
        log_odds += complaints * 0.78                       # Complaints strongly predict churn
        log_odds += (usage_drop_pct / 100.0) * 1.65         # Sharp usage drop predicts churn
        log_odds += (1.0 if tenure_months < 12 else -0.35)  # Early tenure risk
        log_odds += (-0.40 if subscription == 'Postpaid' else 0.15)
        log_odds += (0.45 if recharge_freq <= 2 and subscription == 'Prepaid' else -0.15)
        log_odds += (0.35 if data_usage_gb < 5.0 else -0.20)
        
        # Add realistic unobserved noise
        noise = np.random.normal(0, 0.45)
        prob = 1.0 / (1.0 + np.exp(-(log_odds + noise)))
        
        churn_label = 1 if prob > 0.48 else 0

        records.append({
            'customer_id': cust_id,
            'wilaya': wilaya,
            'subscription': subscription,
            'tenure_months': tenure_months,
            'monthly_spend_dzd': round(monthly_spend, 2),
            'data_usage_gb': round(data_usage_gb, 2),
            'calls_count': calls_count,
            'complaints': complaints,
            'recharge_frequency': recharge_freq,
            'usage_drop_pct': round(usage_drop_pct, 1),
            'churn': churn_label
        })

    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    output_dir = os.path.dirname(os.path.abspath(__file__))
    df = generate_churn_dataset(num_samples=10000, random_seed=42)
    csv_path = os.path.join(output_dir, 'telecom_churn_data.csv')
    df.to_csv(csv_path, index=False)
    churn_rate = (df['churn'].mean()) * 100
    print(f"Generated {len(df)} customer records saved to {csv_path}")
    print(f"Overall Churn Rate: {churn_rate:.2f}%")

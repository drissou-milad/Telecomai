# TelecomAI — Dataset Architecture & Feature Engineering

## 1. Overview

TelecomAI includes reproducible data generation and preprocessing pipelines in `/ml/data` for both subscriber behavior and radio access network telemetry.

---

## 2. Customer Churn Dataset (`telecom_churn_data.csv`)

### 2.1 Dataset Specifications
- **Total Records**: 10,000 subscriber accounts
- **Synthetic Base Churn Rate**: $\approx 17.8\%$ (realistic baseline for prepaid-dominant African/MENA markets)
- **Features**: 8 raw attributes + engineered interaction metrics

### 2.2 Feature Dictionary

| Feature Name | Type | Description | Range / Categories |
| :--- | :--- | :--- | :--- |
| `customer_id` | String | Unique subscriber identifier | `C10001` - `C20000` |
| `monthly_spend_dzd` | Float | Average monthly expenditure in Algerian Dinars (DZD) | 300 - 9,500 DZD |
| `data_usage_gb` | Float | Monthly data consumption volume | 0.5 - 120.0 GB |
| `calls_count` | Integer | Monthly outbound call count | 5 - 350 calls |
| `complaints` | Integer | Customer service complaints logged in past 60 days | 0 - 6 |
| `recharge_frequency`| Integer | Balance replenishment events per month | 1 - 12 recharges |
| `subscription` | String | Account billing contract type | `Prepaid`, `Postpaid` |
| `tenure_months` | Integer | Subscriber account age in months | 1 - 72 months |
| `usage_drop_pct` | Float | Month-over-month usage decrease percentage | 0.0% - 90.0% |
| `churn` | Integer | Ground truth binary churn indicator (target) | `0` (Retained), `1` (Churned) |

### 2.3 Feature Engineering
The preprocessor (`ml/churn/preprocessing.py`) automatically constructs:
- `is_prepaid`: Binary encoding for contract flexibility.
- `arpu_to_usage_ratio`: Spend per gigabyte index, highlighting price sensitivity and tariff mismatch.
- Standardized numeric scaling via `StandardScaler` fitted strictly on training partitions to prevent data leakage.

---

## 3. Network Radio Telemetry Dataset (`telecom_network_cells.csv`)

### 3.1 Dataset Specifications
- **Total Monitored Cells**: 1,000 cell sectors across Algiers, Oran, Constantine, and Annaba
- **Nominal vs Outlier Split**: $\approx 96.3\%$ nominal, $3.7\%$ injected multi-metric telemetry anomalies

### 3.2 Monitored Key Performance Indicators (KPIs)

| Metric | Nominal Distribution | Anomaly Signature |
| :--- | :--- | :--- |
| `latency_ms` | $\mathcal{N}(28, 6)$ ms | Severe spike $> 75$ ms |
| `packet_loss_pct` | $\text{Beta}(1, 20) \approx 0.3\%$ | Drop rate $> 2.5\%$ |
| `users` | 300 - 1,100 connected UEs | Extreme overload $> 1,600$ UEs |
| `traffic_mbps` | 200 - 650 Mbps | Backhaul saturation $> 850$ Mbps |
| `availability_pct` | $99.5\% \pm 0.3\%$ | Degraded carrier $< 97.0\%$ |

---

## 4. Scientific Honesty & Synthetic Data Notice

> **Important Disclosure**:
> - The churn dataset is synthetically generated using rule-based behavioral probability distributions.
> - The Gradient Boosting model achieved a validation ROC-AUC of 0.961 on this synthetic evaluation benchmark.
> - **Performance on synthetic data does not imply identical performance on real operator production data.** Real-world telecom data includes non-stationary macro trends, competitive porting wars (MNP), promotional cannibalization, and noisy billing records.

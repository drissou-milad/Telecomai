# TelecomAI — Model Card

Two independently trained models power this platform. Full methodology and
honest limitations live in [`docs/methodology.md`](./methodology.md) and
[`docs/limitations.md`](./limitations.md) — this page is the quick-reference
summary.

---

## 1. Customer Churn Prediction

| | |
|---|---|
| **Task** | Binary classification — will a subscriber churn within the next 30-day billing cycle |
| **Model** | Gradient Boosting Classifier (scikit-learn), selected as champion over Random Forest, Decision Tree, and Logistic Regression baselines |
| **Selection criterion** | Highest validation ROC-AUC with balanced F1 |
| **Input features** | Monthly spend (DZD), data usage (GB), call count, complaints (60d), recharge frequency, tenure (months), usage decline rate (%), contract type (prepaid/postpaid), cost-per-GB ratio |
| **Output** | Churn probability (0-100%), risk tier (LOW/MEDIUM/HIGH), top contributing risk factors, recommended retention action |
| **Explainability** | SHAP (`TreeExplainer`) — per-prediction feature attributions, not just a global importance ranking |
| **Training data** | Synthetic dataset, 10,000 customers ([`ml/data/telecom_churn_data.csv`](../ml/data/telecom_churn_data.csv)), labels derived from behavioral heuristics (complaints, usage drop, contract type) |
| **Test set** | 2,000 held-out samples (20% split) |

### Evaluation (held-out test set)

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC | Train time |
|---|---|---|---|---|---|---|
| **Gradient Boosting (champion)** | **0.911** | 0.766 | 0.718 | 0.741 | **0.961** | 2,288 ms |
| Random Forest | 0.910 | 0.789 | 0.673 | 0.726 | 0.958 | 726 ms |
| Decision Tree | 0.900 | 0.739 | 0.670 | 0.703 | 0.924 | 27 ms |
| Logistic Regression (baseline) | 0.830 | 0.512 | 0.882 | 0.648 | 0.926 | 15 ms |

Random Forest edges out on precision, but Gradient Boosting was chosen for better
recall balance (0.718 vs 0.673) — in a retention context, a missed churner
(false negative) is a direct revenue loss, so recall matters more than a small
precision gap.

### Top feature importances
1. Subscriber tenure (months) — 29.8%
2. Customer service complaints (60d) — 23.7%
3. Usage decline rate (% month-over-month) — 16.2%
4. Prepaid contract type — 9.8%
5. Data usage volume (GB) — 8.5%

### Limitations
- Trained and evaluated entirely on synthetic data with heuristically-generated
  labels — high benchmark scores reflect internal consistency with the
  generator, not validated performance on a real operator's subscriber base.
- No temporal/seasonal signal (e.g. Ramadan usage shifts, competitor tariff
  campaigns) — see `docs/limitations.md` §2 for the full discussion.

---

## 2. Network Anomaly Detection

| | |
|---|---|
| **Task** | Unsupervised outlier detection on cell-sector telemetry |
| **Model** | Isolation Forest (scikit-learn), 150 estimators, contamination=0.037, max_samples=256 |
| **Learning paradigm** | Strictly unsupervised — trained with no anomaly labels |
| **Input features** | Latency (ms), packet loss (%), connected UEs, throughput (Mbps), availability (%) |
| **Output** | Anomaly score (Isolation Forest decision function), NORMAL/ANOMALY flag, likely causes, recommended NOC action |
| **Training data** | Synthetic telemetry for 1,000 cell sectors ([`ml/data/telecom_network_cells.csv`](../ml/data/telecom_network_cells.csv)) |

### Evaluation
- 37 of 1,000 cells (3.7%) flagged as anomalous, matching the injected
  contamination rate.
- **Note on ROC-AUC**: the saved evaluation reports a ROC-AUC of 1.0 against
  synthetic ground-truth labels. This is expected, not impressive — those
  labels come from the same generator that injected the anomalies, and are
  used only *post-hoc* to calibrate the isolation threshold, never during
  training. It measures self-consistency with the data generator, not
  real-world detection accuracy. See `docs/methodology.md` §3.1.

### Limitations
- Isolation Forest can't distinguish a legitimate traffic spike (e.g. a
  stadium event) from a genuine fault — both look like density outliers.
  Production deployment would need calendar/event-awareness on top of this.
- Benchmarked entirely on synthetic telemetry; no live network validation.

---

## Scope note

Both models are decision-support outputs for a NOC/retention team, not
closed-loop actuators — TelecomAI does not automatically execute network
changes or customer offers. See `docs/limitations.md` §4.

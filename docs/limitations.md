# TelecomAI — Limitations & Operational Constraints

## 1. Scope & System Boundaries

TelecomAI is engineered as an operational intelligence platform, decision-support prototype, and technical portfolio demonstration. The following architectural and mathematical limitations should be acknowledged:

---

## 2. Dataset Limitations

1. **Synthetic Generation Artifacts**:
   - The customer churn labels are derived from behavioral heuristics (complaints count, usage drop rate, contract type).
   - In production operator environments, churn behavior exhibits complex non-linear interdependencies, seasonal macro fluctuations (e.g., Ramadan, summer holiday usage surges), and competitive tariff campaigns from competing MNOs.
2. **Evaluation Metrics Calibration**:
   - High validation performance metrics (e.g., ROC-AUC 0.961 on Gradient Boosting) reflect consistency against the underlying synthetic generation generator rather than empirical validation on live operator networks.
   - **Performance on synthetic benchmarks does not guarantee performance on live production subscriber feeds.**

---

## 3. Unsupervised Learning Constraints

1. **Anomaly Label Independence**:
   - **Isolation Forest is strictly unsupervised and does not learn from fault or anomaly labels.**
   - Anomaly benchmarking is performed post-hoc using synthetic ground truth to calibrate isolation thresholds.
2. **False Positive Management**:
   - In cellular networks, flash crowd events (stadium concerts, religious gatherings) generate abrupt spikes in active UEs and backhaul throughput. In unsupervised isolation modeling, such events may be flagged as anomalies despite representing legitimate peak utilization rather than infrastructure fault. Operational deployments require spatial correlation and calendar-event awareness.

---

## 4. Actuation & Execution Boundaries

1. **No Direct Network Actuation**:
   - TelecomAI provides **AI Recommended Actions** for Network Operations Centers (NOCs) and Field Operations teams.
   - It **does NOT** execute automated closed-loop RAN beam steering, carrier shutdown, or BGP route flapping. Telecom regulatory frameworks and 3GPP standards mandate human operator oversight for critical network adjustments.
2. **Retention Intervention Execution**:
   - Customer retention actions (loyalty bonuses, tariff discount offers, customer service call scheduling) are modeled as simulated interventions. Integration into production carrier CRM/billing gateways (e.g., Ericsson BSCS, Amdocs, Huawei CBS) requires formal OSS/BSS connectors.

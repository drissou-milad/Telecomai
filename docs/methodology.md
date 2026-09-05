# TelecomAI — Machine Learning Methodology & Evaluation Framework

## 1. Executive Summary

TelecomAI employs two distinct machine learning paradigms tailored to telecom operational challenges:
1. **Supervised Customer Churn Prediction**: Identifying subscribers at imminent risk of deactivating service or discontinuing recharge activity.
2. **Unsupervised Radio Access Network (RAN) Anomaly Detection**: Identifying cell sectors exhibiting multivariate telemetry degradation without relying on historical fault labels.

---

## 2. Supervised Churn Modeling Pipeline

### 2.1 Problem Formulation
Customer churn in telecommunications is formulated as a binary classification problem:
$$y \in \{0, 1\}$$
where $y = 1$ denotes that a subscriber disconnects or ceases recharge activity within the subsequent 30-day billing cycle.

### 2.2 Model Exploration & Champion Selection
To establish a rigorous machine learning benchmark, four distinct algorithms are trained under identical 5-fold stratified cross-validation and evaluated on a held-out test partition (20% holdout):

| Model | Validation ROC-AUC | Precision | Recall | F1-Score | Training Latency | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting Classifier** | **0.961** | **0.766** | **0.718** | **0.741** | 2,288 ms | **Selected Champion** |
| **Random Forest Classifier** | 0.958 | 0.789 | 0.673 | 0.726 | 726 ms | Candidate |
| **Decision Tree Classifier** | 0.924 | 0.739 | 0.670 | 0.703 | 27 ms | Baseline |
| **Logistic Regression (L2 regularized)** | 0.926 | 0.512 | 0.882 | 0.648 | 15 ms | Baseline |

> **Champion Selection Rationale**: While Random Forest achieved marginally higher precision, Gradient Boosting delivered superior balanced recall (0.718 vs 0.673) and the highest validation ROC-AUC (0.961). In telecom retention operations, false negatives (missed churning customers) represent direct recurring revenue loss, making recall balance critical.

### 2.3 Explainability Framework: SHAP TreeExplainer
To ensure predictions are actionable for retention teams, the platform integrates **SHAP (SHapley Additive exPlanations)** via `shap.TreeExplainer`:
- **Mathematical Foundation**: Computes Shapley values from cooperative game theory to quantify each feature's marginal contribution to log-odds shift from expected baseline.
- **Local vs. Global Attributions**:
  - Global: Ranks features across the entire population (Subscriber Tenure, Customer Service Complaints, and Month-over-Month Usage Decline are the top 3 drivers).
  - Local: Computes per-subscriber feature impact vectors for each individual prediction (e.g., Customer Service Complaints $+3.43$, Subscriber Tenure $+1.48$).
- **Fallback Integrity**: If TreeExplainer cannot be loaded, the system explicitly labels explanations as **Feature Attribution** rather than misleadingly claiming SHAP calculation.

---

## 3. Unsupervised Cellular Anomaly Detection

### 3.1 Unsupervised Paradigm Clarification
> **Critical Methodological Distinction**:
> **Isolation Forest is trained in a strictly unsupervised manner without using anomaly labels.**
> Radio telemetry features (transport latency, packet loss, active connected UEs, throughput, availability) are normalized and partitioned using random axis-aligned splits. The algorithm isolates anomalous points because outliers require significantly fewer splits to isolate than points in dense nominal clusters.
> 
> **Synthetic anomaly labels are used ONLY after training to benchmark detection performance and establish threshold calibration.** During inference, the decision function operates purely on metric density and geometric isolation depth.

### 3.2 Key Monitored Telemetry
1. **Transport Round-Trip Latency ($ms$)**: Baseline $\approx 30$ ms; SLA warning $> 55$ ms; critical anomaly $> 75$ ms.
2. **Packet Drop Rate ($\%$)**: Nominal $< 0.5\%$; degraded $> 1.5\%$; critical $> 2.8\%$.
3. **Connected User Equipment (UEs)**: Nominal 400–1,200; congestion $> 1,600$ UEs.
4. **Backhaul Throughput ($Mbps$)**: Monitored against sector spectral efficiency.
5. **Carrier Availability ($\%$)**: SLA benchmark $99.5\%$; breach threshold $< 98.0\%$.

---

## 4. Defensible AI Recommendations vs Automated Actuation

In operational telecom carrier networks, AI models do not autonomously reconfigure core routing tables or actuate antenna tilt without multi-tier Network Operations Center (NOC) oversight. 

TelecomAI adheres to technically defensible advisory outputs:
- **Network Actions**: Formatted as **AI Recommended Actions** (e.g., *"Investigate radio congestion and evaluate traffic redistribution to neighboring cells. Verify microwave/fiber backhaul interface error counters and inspect transmission alarms."*).
- **Customer Retention Actions**: Formatted as operator decision-support simulations (e.g., *"Recommended retention action: Consider a personalized data/loyalty offer and proactive customer-care intervention. Example intervention: 15 GB retention bonus."*).

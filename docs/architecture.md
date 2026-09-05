# TelecomAI — System Architecture & Engineering Specifications

## 1. High-Level Architecture Overview

TelecomAI follows a decoupled, three-tier enterprise architecture separating data processing, machine learning inference, API orchestration, and reactive presentation:

```
                          TELECOMAI PLATFORM
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
  CUSTOMER DATA                                      NETWORK DATA
 (10k Subscribers)                                  (1,000 Cells)
         │                                                 │
         ▼                                                 ▼
   Preprocessing                                     Preprocessing
  (StandardScaler)                                  (StandardScaler)
         │                                                 │
         ▼                                                 ▼
  Churn ML Pipeline                                 Anomaly Pipeline
 (GradBoost, RF, LR, DT)                           (Isolation Forest)
         │                                                 │
         ▼                                                 ▼
   Champion Model                                   Outlier Detector
(champion_model.joblib)                         (isolation_forest.joblib)
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                  ▼
                        FastAPI Backend Layer
                     (/api/predict/churn, etc.)
                                  │
                                  ▼
                         Express / Reverse Proxy
                              (Port 3000)
                                  │
                                  ▼
                        React + Tailwind UI
                       (Interactive Dashboard)
```

---

## 2. Component Specifications

### 2.1 Machine Learning Tier (`/ml`)
- **Language**: Python 3.10+
- **Core Frameworks**: `scikit-learn`, `pandas`, `numpy`, `joblib`, `shap`
- **Pipelines**:
  - `ml/churn/train.py`: Multi-model benchmarking with 5-fold stratified cross-validation and dynamic champion selection.
  - `ml/churn/evaluate.py`: Generates confusion matrices, ROC curves, and global SHAP feature importances.
  - `ml/churn/predict.py`: Standalone inference class with real `shap.TreeExplainer`.
  - `ml/anomaly/train.py`: Unsupervised Isolation Forest model training on 5 cellular KPIs.
  - `ml/anomaly/predict.py`: Unsupervised anomaly scorer with decision function density evaluation.

### 2.2 FastAPI Backend Tier (`/backend`)
- **Framework**: `FastAPI` + `Uvicorn` + `Pydantic v2`
- **Endpoints**:
  - `POST /api/predict/churn`: Accepts subscriber telemetry, validates via Pydantic, invokes Champion Model, computes real SHAP attributions, and returns structured risk mitigation actions.
  - `GET /api/churn/benchmark`: Returns cross-validation benchmark metrics and confusion matrices across evaluated algorithms.
  - `POST /api/predict/anomaly`: Evaluates cell sector telemetry with Isolation Forest, returning outlier scores and AI Recommended Actions.
  - `GET /api/anomaly/specs`: Returns Isolation Forest contamination parameters and telemetry distributions.
  - `GET /api/health`: Provides subsystem health status and model availability verification.
  - `/docs` & `/redoc`: Interactive OpenAPI documentation.

### 2.3 Frontend Tier (`/src`)
- **Framework**: React 18+ with TypeScript and Vite
- **Styling**: Tailwind CSS with enterprise dark slate palette
- **Data Visualization**: Recharts, D3, Lucide icons, Motion
- **Pages**:
  - `OverviewPage`: Executive KPIs, network health summary, subscriber risk distribution.
  - `PredictionsPage`: Interactive churn simulator with real SHAP attribution watermarks and multi-model benchmark comparisons.
  - `AnomalyPage`: Live cellular radio health map, outlier inspection, and AI Recommended Actions.
  - `CustomersPage`: Detailed subscriber directory with drill-down views (including customer C10245 with real SHAP attributions).
  - `AnalyticsPage`: Regional telecom analytics across Algerian wilayas (Algiers, Oran, Constantine, Annaba).

---

## 3. Strict Model Availability & Error Handling

To preserve production engineering integrity:
- **No Pseudo-ML Fallbacks**: If model weight artifacts (`champion_model.joblib` or `isolation_forest.joblib`) are missing, the API does NOT invent fallback numbers. Instead, it explicitly raises `HTTP 503 Service Unavailable` with `"ML model unavailable. Train the model first."`
- **Explainability Transparency**: If SHAP is uninitialized, attributions are honestly designated as **Feature Attribution** rather than claiming fake SHAP calculations.

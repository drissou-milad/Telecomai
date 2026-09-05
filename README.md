# TelecomAI — Telecom Network & Customer Intelligence Platform

An end-to-end machine learning and operational intelligence platform designed for mobile network operators. TelecomAI combines **supervised customer churn modeling** with explainable AI (SHAP) and **unsupervised cellular radio anomaly detection** (Isolation Forest) into an interactive operations console.

---

## Architecture Overview

```
                     TELECOMAI
                         │
        ┌────────────────┴────────────────┐
        │                                 │
 CUSTOMER DATA                       NETWORK DATA
 (10k Subscribers)                  (1,000 Cells)
        │                                 │
        ▼                                 ▼
 Data Processing                    Data Processing
  (StandardScaler)                   (StandardScaler)
        │                                 │
        ▼                                 ▼
Churn ML Pipeline                  Anomaly Pipeline
(GradBoost, RF, LR, DT)            (Isolation Forest)
        │                                 │
        ▼                                 ▼
Champion Model                    Isolation Forest
(champion_model.joblib)       (isolation_forest.joblib)
        │                                 │
        └──────────────┬──────────────────┘
                       ▼
                    FastAPI
             (Validation & Inference)
                       │
                       ▼
                     React
             (Operations Dashboard)
```

---

## Key Modules

### 1. Customer Churn Prediction & Multi-Model Benchmark
- **Problem**: Identifying high-risk prepaid and postpaid subscribers prior to contract termination or recharge lapse.
- **Algorithms Evaluated**: Logistic Regression, Decision Tree, Random Forest, and Gradient Boosting under 5-fold stratified validation.
- **Dynamic Champion**: **Gradient Boosting Classifier** selected as champion with **ROC-AUC: 0.961**, **Precision: 0.766**, **Recall: 0.718**, and **F1 Score: 0.741**.
- **Explainable AI**: Real **SHAP (SHapley Additive exPlanations)** integration using `shap.TreeExplainer` providing both global feature importance rankings and local per-subscriber attribution vectors.
- **Actionable Retention Recommendations**: Translates risk probabilities into simulated retention workflows (e.g., proactive loyalty bonuses, bill checkups).

> **Methodological Note on Churn Data**: The churn dataset is generated synthetically using behavioral rules. The Gradient Boosting model achieved an ROC-AUC of 0.961 on this synthetic evaluation benchmark. Performance on synthetic data does not imply identical performance on real operator data.

### 2. Unsupervised Radio Access Network (RAN) Anomaly Detection
- **Algorithm**: **Isolation Forest** (scikit-learn) evaluated across 5 key cellular performance metrics:
  - Transport round-trip latency ($ms$)
  - Packet drop rate ($\%$)
  - Active connected user equipment (UEs)
  - Backhaul throughput ($Mbps$)
  - Carrier availability ($\%$)
- **AI Recommended Actions**: Formulates technically defensible recommendations for Network Operations Centers (NOCs) rather than unrealistic automated actuation.

> **Methodological Note on Anomaly Detection**: Isolation Forest is trained strictly in an unsupervised manner without using anomaly labels. Synthetic anomaly labels are used only after training to benchmark detection performance and calibrate decision thresholds.

---

## Repository Structure

```
TelecomAI/
│
├── frontend/ (src/)
│   ├── components/            # UI components and navigation
│   ├── pages/                 # Dashboard, Predictions, Anomaly, Customers, Analytics
│   ├── ml/mlEngine.ts         # Frontend adapter connected to backend APIs
│   └── types.ts               # Core TypeScript definitions
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── routes/            # Route handlers (/churn, /anomaly, /health)
│   │   ├── services/          # Inference & benchmark service providers
│   │   └── schemas/           # Pydantic v2 request/response schemas
│   └── requirements.txt       # Backend Python dependencies
│
├── ml/
│   ├── data/                  # Synthetic generation scripts & CSV datasets
│   │   ├── generate_churn.py
│   │   └── generate_network.py
│   ├── churn/                 # Supervised churn pipeline
│   │   ├── train.py           # Multi-model benchmarking & champion export
│   │   ├── evaluate.py        # Metrics, ROC curves, SHAP TreeExplainer
│   │   ├── predict.py         # Production inference with SHAP attributions
│   │   └── preprocessing.py   # Scikit-learn feature preprocessor
│   ├── anomaly/               # Unsupervised anomaly pipeline
│   │   ├── train.py           # Isolation Forest training & export
│   │   ├── evaluate.py        # Telemetry benchmark & percentile distribution
│   │   ├── predict.py         # Outlier decision function inference
│   │   └── preprocessing.py   # Robust KPI scaler
│   └── notebooks/             # Exploratory analysis Jupyter notebooks
│       ├── churn_analysis.ipynb
│       └── anomaly_analysis.ipynb
│
├── docs/
│   ├── architecture.md        # Technical design & API data flows
│   ├── methodology.md         # Supervised & unsupervised learning principles
│   ├── dataset.md             # Feature dictionaries & engineering notes
│   └── limitations.md         # Scientific honesty & deployment boundaries
│
├── docker-compose.yml         # Containerized multi-service orchestration
├── README.md                  # Project documentation
└── LICENSE                    # MIT License
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm / bun

### 1. Train Machine Learning Models
```bash
# Generate datasets
python3 ml/data/generate_churn.py
python3 ml/data/generate_network.py

# Train churn benchmark & export champion
python3 ml/churn/train.py

# Train unsupervised Isolation Forest
python3 ml/anomaly/train.py
```

### 2. Launch FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API documentation will be available at `http://localhost:8000/docs`.

### 3. Launch Frontend Dashboard
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predict/churn` | Evaluates subscriber churn probability with SHAP TreeExplainer attributions. |
| `GET` | `/api/churn/benchmark` | Returns 5-fold cross-validation metrics and confusion matrices across 4 models. |
| `POST` | `/api/predict/anomaly` | Evaluates cell sector telemetry using unsupervised Isolation Forest. |
| `GET` | `/api/anomaly/specs` | Returns contamination rates and baseline KPI thresholds. |
| `GET` | `/api/dashboard/summary` | Headline KPIs computed by scoring the full synthetic dataset with the trained models (not hardcoded). |
| `GET` | `/api/health` | Subsystem health check and model availability verification. |

> **Note on `npm run dev`**: the Node/Vite dev server (`server.ts`) is a thin static-file server plus a reverse proxy for `/api/*` — it does not invoke Python itself. It forwards every API call to the FastAPI backend at `BACKEND_API_URL` (default `http://localhost:8000`), so the backend from step 2 must be running first.

### Example Churn Prediction Request
```bash
curl -X POST http://localhost:8000/api/predict/churn \
  -H "Content-Type: application/json" \
  -d '{
    "monthlySpendDZD": 1800,
    "dataUsageGB": 4.2,
    "callsCount": 34,
    "complaints": 3,
    "rechargeFrequency": 2,
    "subscription": "Prepaid",
    "tenureMonths": 8,
    "usageDropPct": 45
  }'
```

---

## Deployment

TelecomAI deploys as two independent web services: the FastAPI backend and the
Node/Express frontend (which serves the built React app and proxies `/api/*`
to the backend). A ready-to-use `render.yaml` blueprint is included.

### Option A: Render (recommended, one blueprint)
1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint** and point it at the repo. Render reads
   `render.yaml` and creates two services: `telecomai-api` (Python/FastAPI) and
   `telecomai-web` (Node/Express + React).
3. Wait for `telecomai-api` to finish deploying, then copy its public URL
   (e.g. `https://telecomai-api.onrender.com`).
4. Open `telecomai-web` → **Environment**, set `BACKEND_API_URL` to that URL,
   and trigger **Manual Deploy → Deploy latest commit**.
5. Once `telecomai-web` finishes, its URL is your live demo link.

> **Free-tier note**: Render's free instances spin down after 15 minutes of
> inactivity. The first request after idle can take 30-60 seconds to wake the
> backend - normal, not a bug. Worth mentioning if you link this to recruiters.

### Option B: Split hosting (Vercel + Render/Railway)
The frontend can also be deployed as a static site (Vercel, Netlify, etc.)
instead of running `server.ts`:
1. Deploy the backend as in Option A (or on Railway/Fly.io).
2. Build only the static assets: `npm run build:frontend` (outputs to `dist/`).
3. Deploy `dist/` as a static site on Vercel.
4. Add a rewrite so `/api/*` on your Vercel domain forwards to the backend's
   public URL (Vercel `vercel.json` `rewrites`, or Netlify `_redirects`) -
   the frontend code always calls relative `/api/...` paths, so it doesn't
   need to know the backend's URL directly as long as the rewrite exists.

---

## Scientific Honesty & Limitations
- **Synthetic Data**: Models are trained on synthetic telecom data adhering to realistic distributions. High benchmark accuracy does not replace live pilot validation.
- **Unsupervised Learning**: Isolation Forest is trained without labels; benchmark metrics are computed post-hoc.
- **Advisory Only**: Network and customer retention recommendations are generated as decision-support advisory outputs, not direct actuators.

See `docs/limitations.md` and `docs/methodology.md` for in-depth discussion.

---

## License
Distributed under the MIT License. See `LICENSE` for more information.

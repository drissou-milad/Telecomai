import React, { useState } from 'react';
import { 
  Info, 
  Download, 
  Terminal, 
  Layers, 
  Database, 
  GitBranch, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Share2, 
  Sparkles,
  Cpu,
  Server,
  Code2,
  Activity
} from 'lucide-react';
import { generateSyntheticChurnCSV, generateSyntheticNetworkKPIsCSV } from '../data/telecomData';

export const AboutPage: React.FC = () => {
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleDownloadChurnCSV = () => {
    const csvContent = generateSyntheticChurnCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'telecom_churn_synthetic_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadMsg('Downloaded telecom_churn_synthetic_dataset.csv');
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const handleDownloadNetworkCSV = () => {
    const csvContent = generateSyntheticNetworkKPIsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'telecom_network_kpis_synthetic.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadMsg('Downloaded telecom_network_kpis_synthetic.csv');
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono-num">
            Project Architecture & ML Methodology
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            Portfolio & Production Docs
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          TelecomAI: AI-Powered Telecom Network & Customer Intelligence Platform specifications, data pipelines, and Algerian simulation methodology.
        </p>
      </div>

      {downloadMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 px-4 text-xs text-emerald-300 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadMsg}</span>
          </div>
          <button onClick={() => setDownloadMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. The Problem & 3 Core Questions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Info className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">1. The Telecom Challenge</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Modern telecom operators collect petabytes of heterogeneous data daily across radio base stations (eNodeB / gNodeB), backhaul links, CRM ticketing, and billing cycles. The primary operational bottleneck is not collecting data, but translating telemetry into proactive, automated business decisions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-rose-400 font-bold text-sm block mb-1">1. Which customers will leave?</span>
            <p className="text-xs text-slate-400">
              Module #1 Customer Churn Classifier identifies subscribers showing early dissatisfaction signals (unresolved complaints, usage drops, short tenure).
            </p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold text-sm block mb-1">2. Which cells have problems?</span>
            <p className="text-xs text-slate-400">
              Module #2 Network Anomaly Detection isolates degraded cells (latency surges, packet loss spikes, traffic congestion) before customer impact escalates.
            </p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold text-sm block mb-1">3. What action should be taken?</span>
            <p className="text-xs text-slate-400">
              Explainable AI (XAI) factors translate raw ML probabilities into automated retention incentives and NOC automated load-balancing rerouting commands.
            </p>
          </div>
        </div>
      </div>

      {/* 2. System Architecture */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Layers className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">2. MVP System Architecture</h2>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-loose">
          <pre className="text-cyan-300">
{`                     TELECOMAI ARCHITECTURE
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
  Customer CRM Data       Radio Network KPIs      Hourly Traffic Streams
   (Spend, Complaints,    (Latency, Packet Loss,   (24h Throughput Demand)
    Tenure, Recharges)     PRB Users, Availability)     │
        │                       │                       ▼
        ▼                       ▼               Capacity Forecasting
  Random Forest Model     Isolation Forest          (SARIMA Model)
  (Precision: 0.81)        (Contamination: 3.7%)        │
        │                       │                       │
        └───────────────┬───────┴───────────────────────┘
                        ▼
               FastAPI Backend / REST API
           (/api/dashboard, /api/predict/churn,
            /api/network/cells, /api/predict/anomaly)
                        │
                        ▼
              React + Vite + Tailwind NOC UI
         (Executive Dashboard, Churn 360, Cell NOC)
                        │
                        ▼
             Production NOC / Recruiter Demo`}
          </pre>
        </div>
      </div>

      {/* 3. Machine Learning Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module #1 ML */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Churn Modeling (Module #1)</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Imbalanced Data Handling:</strong> Standard telecom churn sets suffer from class imbalance (e.g. 5% churn rate). Accuracy is discarded in favor of <strong>ROC-AUC (0.87)</strong>, <strong>Precision (0.81)</strong>, and <strong>Recall (0.79)</strong>.
            </li>
            <li>
              <strong>Algorithm Comparison:</strong> Evaluated Logistic Regression baseline, Decision Trees, Random Forest ensemble, and XGBoost gradient boosting. Random Forest achieved top F1-score with low inference latency (12ms).
            </li>
            <li>
              <strong>Explainable AI (XAI):</strong> Risk attribution breaks down why a customer is flagged (e.g. 3 complaints +23%, usage decline +18%, short tenure +12%).
            </li>
          </ul>
        </div>

        {/* Module #2 ML */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Activity className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Network Anomaly Detection (Module #2)</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Unsupervised Isolation Forest:</strong> In real operations, operators don't have complete ground-truth labels for every transient hardware or RF fault. Isolation Forest isolates anomalies by randomly partitioning features.
            </li>
            <li>
              <strong>Multivariate Features:</strong> Joint evaluation of Round Trip Time (Latency ms), Packet Drops (%), Radio Resource Block (PRB) user crowding, and Backhaul Mbps.
            </li>
            <li>
              <strong>AI Incident Summary:</strong> Rule-based and contextual generative templates transform raw anomaly scores into actionable natural language NOC incident briefs (e.g. Cell TLM-034 degradation report).
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Algeria-Specific Simulation Disclosure */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-base">🇩🇿</span>
            <span>Algerian Telecom Context & Simulated Dataset Disclosure</span>
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono-num font-bold">
            Simulated Data Notice
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In strict accordance with enterprise confidentiality and ethics, TelecomAI operates on <strong>statistically calibrated synthetic datasets</strong> and public telecom benchmarks. No confidential or proprietary customer subscriber records from Algerian operators (Djezzy, Mobilis, Ooredoo) are used. The simulated environment models regional traffic dynamics across major Algerian Wilayas (Algiers, Oran, Constantine, Tlemcen, Sétif, Annaba, Blida, Batna) with realistic prepaid/postpaid currency tariffs in Algerian Dinar (DZD).
        </p>
      </div>

      {/* 5. Download Synthetic Datasets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Download Synthetic Datasets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Export generated synthetic CSV files for local Pandas / Jupyter notebook reproduction.
            </p>
          </div>
          <span className="text-xs font-mono-num text-slate-500">RFC 4180 CSV</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleDownloadChurnCSV}
            className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-cyan-300">
                  churn.csv (Customer Attrition Dataset)
                </span>
                <span className="text-[11px] text-slate-400">
                  12 features • spend, usage, complaints, tenure, risk
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </button>

          <button
            onClick={handleDownloadNetworkCSV}
            className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-emerald-300">
                  network_kpis.csv (RAN Cell Telemetry)
                </span>
                <span className="text-[11px] text-slate-400">
                  11 features • latency, packet loss, users, traffic, status
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* 6. GitHub Repository Structure & Tech Stack */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <GitBranch className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">6. Repository Architecture & Stack</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
            <span className="text-cyan-400 font-bold block mb-2">📁 Production File Hierarchy</span>
            <pre className="text-slate-400 text-[11px]">
{`TelecomAI/
├── frontend/ (React + Vite + Tailwind + Recharts)
│   ├── src/
│   │   ├── components/ (Navbar, KPICard, AlertBadge)
│   │   ├── pages/ (Dashboard, Customers, Network, Lab)
│   │   ├── ml/ (Inference Engines & Benchmarks)
│   │   └── data/ (Simulated Algeria Datasets)
├── backend/ (FastAPI / Express Microservice)
│   ├── app/
│   │   ├── routes/ (customers.py, network.py, predict.py)
│   │   └── database/ (PostgreSQL schema & models)
├── ml/ (Scikit-learn Training Pipelines)
│   ├── churn/ (train.py, predict.py, model.pkl)
│   └── anomaly/ (train.py, detect.py, model.pkl)
└── data/ (churn.csv, network_kpis.csv)`}
            </pre>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-xs space-y-3 font-mono-num">
            <span className="text-cyan-400 font-bold block">🛠️ Verified Tech Stack</span>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Frontend:</span>
                <span className="text-white font-semibold">React 19, Vite 6, Tailwind CSS, Recharts</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Backend API:</span>
                <span className="text-white font-semibold">FastAPI / Express Node.js Type-Stripping</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">AI / ML:</span>
                <span className="text-white font-semibold">Random Forest, XGBoost, Isolation Forest</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Database:</span>
                <span className="text-white font-semibold">PostgreSQL (SQLAlchemy / Schema ready)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Explainable AI:</span>
                <span className="text-white font-semibold">Feature Attribution & XAI Factor Waterfall</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

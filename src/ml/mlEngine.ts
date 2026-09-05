/**
 * Frontend API Adapter for Telecom ML Suite
 * Bridges the UI to the Python scikit-learn & SHAP pipelines via the FastAPI backend.
 *
 * There is no client-side model logic here on purpose: every prediction and every
 * benchmark/spec number comes from the trained models via HTTP. If the backend is
 * unreachable, callers get a rejected promise (surfaced as an inference error in the UI)
 * rather than a silently-substituted guess.
 *
 * Connected Models:
 * - Customer Churn: Multi-Model Benchmark (Champion: Gradient Boosting selected via validation ROC-AUC / F1)
 * - Network Anomaly: Unsupervised Isolation Forest
 * - Explainability: SHAP (SHapley Additive exPlanations) Attributions
 */

import {
  RiskLevel,
  CellStatus,
  RiskFactor,
  ModelComparison,
  FeatureImportance,
  DashboardSummary
} from '../types';

export interface ChurnPredictionInput {
  monthlySpendDZD: number;
  dataUsageGB: number;
  callsCount: number;
  complaints: number;
  rechargeFrequency: number;
  subscription: 'Prepaid' | 'Postpaid';
  tenureMonths: number;
  usageDropPct?: number;
}

export interface ChurnPredictionResult {
  churnProbability: number; // 0 - 100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendedAction: string;
  retentionImpactEstimate: string;
}

export interface AnomalyPredictionInput {
  cellId: string;
  users: number;
  latencyMs: number;
  packetLossPct: number;
  trafficMbps: number;
  availabilityPct: number;
}

export interface AnomalyPredictionResult {
  status: CellStatus;
  anomalyScore: number; // -1 to 1 (Isolation Forest decision function: negative indicates outlier)
  confidencePct: number;
  possibleCauses: string[];
  aiIncidentSummary: string;
  recommendedResolution: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errData.error || errData.detail || `Inference error: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Executes real-time churn inference via the FastAPI backend.
 * Calls the scikit-learn champion model and returns real SHAP TreeExplainer attributions.
 * Throws if the model is unavailable (HTTP 503) or the backend is unreachable.
 */
export async function predictCustomerChurnApi(input: ChurnPredictionInput): Promise<ChurnPredictionResult> {
  return fetchJson<ChurnPredictionResult>('/api/predict/churn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

/**
 * Executes real-time anomaly inference via the FastAPI backend.
 * Calls the scikit-learn unsupervised Isolation Forest.
 * Throws if the model is unavailable (HTTP 503) or the backend is unreachable.
 */
export async function predictNetworkAnomalyApi(input: AnomalyPredictionInput): Promise<AnomalyPredictionResult> {
  return fetchJson<AnomalyPredictionResult>('/api/predict/anomaly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

/**
 * Multi-Model Benchmark Results, fetched from the Python training pipeline's
 * saved evaluation (ml/churn/evaluation_results.json) via the backend - not hardcoded.
 */
export async function getChurnBenchmark(): Promise<{ models: ModelComparison[]; featureImportances: FeatureImportance[] }> {
  const data = await fetchJson<any>('/api/churn/benchmark');
  return {
    models: data.models,
    featureImportances: data.featureImportances
  };
}

/**
 * Isolation Forest specs and training-time evaluation, fetched from the backend
 * (ml/anomaly/model_specs.json) - not hardcoded.
 */
export async function getAnomalySpecs(): Promise<{
  modelName: string;
  contamination: number;
  nEstimators: number;
  maxSamples: string;
  metricsMonitored: string[];
  totalCellsMonitored: number;
  anomaliesDetected: number;
  normalCells: number;
  rocAucEstimate: number;
}> {
  return fetchJson('/api/anomaly/specs');
}

/**
 * Headline platform KPIs, computed on the backend by scoring the full synthetic
 * churn dataset with the trained model and aggregating the cell telemetry dataset.
 * See backend/app/services/dashboard_service.py - nothing here is hand-typed.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>('/api/dashboard/summary');
}

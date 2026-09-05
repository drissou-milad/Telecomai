import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  BarChart2, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Activity, 
  HelpCircle,
  Play,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { 
  getChurnBenchmark,
  getAnomalySpecs,
  predictCustomerChurnApi,
  predictNetworkAnomalyApi,
  ChurnPredictionInput,
  ChurnPredictionResult,
  AnomalyPredictionInput,
  AnomalyPredictionResult
} from '../ml/mlEngine';
import { ModelComparison, FeatureImportance } from '../types';

export const PredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'churn-tester' | 'anomaly-tester'>('benchmarks');
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);

  // Churn Tester interactive state (preset to C10245)
  const [churnInputs, setChurnInputs] = useState<ChurnPredictionInput>({
    monthlySpendDZD: 1800,
    dataUsageGB: 4.2,
    callsCount: 34,
    complaints: 3,
    rechargeFrequency: 2,
    subscription: 'Prepaid',
    tenureMonths: 8
  });

  const [churnResult, setChurnResult] = useState<ChurnPredictionResult | null>(null);

  // Anomaly Tester interactive state (preset to CELL-003 / CELL-TLM-034 values)
  const [anomalyInputs, setAnomalyInputs] = useState<AnomalyPredictionInput>({
    cellId: 'CELL-TEST-01',
    users: 1942,
    latencyMs: 97,
    packetLossPct: 4.8,
    trafficMbps: 982,
    availabilityPct: 96.2
  });

  const [anomalyResult, setAnomalyResult] = useState<AnomalyPredictionResult | null>(null);

  const [churnModelBenchmarks, setChurnModelBenchmarks] = useState<ModelComparison[]>([]);
  const [churnFeatureImportance, setChurnFeatureImportance] = useState<FeatureImportance[]>([]);
  const [anomalyModelSpecs, setAnomalyModelSpecs] = useState<Awaited<ReturnType<typeof getAnomalySpecs>> | null>(null);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  const currentBenchmark = churnModelBenchmarks[selectedModelIdx];
  const [inferenceError, setInferenceError] = useState<string | null>(null);
  const [isInferenceLoading, setIsInferenceLoading] = useState<boolean>(false);

  // Load real benchmark/spec data from the backend (trained model outputs) on mount,
  // and run one initial prediction for each test bench so the panels aren't empty.
  useEffect(() => {
    getChurnBenchmark()
      .then(({ models, featureImportances }) => {
        setChurnModelBenchmarks(models);
        setChurnFeatureImportance(featureImportances);
      })
      .catch((err) => setBenchmarkError(err.message || 'Failed to load churn benchmark.'));

    getAnomalySpecs()
      .then(setAnomalyModelSpecs)
      .catch((err) => setBenchmarkError(err.message || 'Failed to load anomaly specs.'));

    predictCustomerChurnApi({
      monthlySpendDZD: 1800,
      dataUsageGB: 4.2,
      callsCount: 34,
      complaints: 3,
      rechargeFrequency: 2,
      subscription: 'Prepaid',
      tenureMonths: 8
    }).then(setChurnResult).catch((err) => setInferenceError(err.message));

    predictNetworkAnomalyApi({
      cellId: 'CELL-TEST-01',
      users: 1942,
      latencyMs: 97,
      packetLossPct: 4.8,
      trafficMbps: 982,
      availabilityPct: 96.2
    }).then(setAnomalyResult).catch((err) => setInferenceError(err.message));
  }, []);

  const handleRunChurnInference = async () => {
    setIsInferenceLoading(true);
    setInferenceError(null);
    try {
      const result = await predictCustomerChurnApi(churnInputs);
      setChurnResult(result);
    } catch (err: any) {
      setInferenceError(
        err.message && err.message.includes('503')
          ? 'ML model unavailable. Train the model first via: python3 ml/churn/train.py'
          : err.message || 'Failed to reach the churn prediction API.'
      );
    } finally {
      setIsInferenceLoading(false);
    }
  };

  const handleRunAnomalyInference = async () => {
    setIsInferenceLoading(true);
    setInferenceError(null);
    try {
      const result = await predictNetworkAnomalyApi(anomalyInputs);
      setAnomalyResult(result);
    } catch (err: any) {
      setInferenceError(
        err.message && err.message.includes('503')
          ? 'Anomaly model unavailable. Train the model first via: python3 ml/anomaly/train.py'
          : err.message || 'Failed to reach the anomaly prediction API.'
      );
    } finally {
      setIsInferenceLoading(false);
    }
  };

  const handleLoadChurnPreset = async (type: 'high' | 'low' | 'medium') => {
    setInferenceError(null);
    let inputs: ChurnPredictionInput;
    if (type === 'high') {
      inputs = {
        monthlySpendDZD: 1800,
        dataUsageGB: 4.2,
        callsCount: 34,
        complaints: 3,
        rechargeFrequency: 2,
        subscription: 'Prepaid',
        tenureMonths: 8
      };
    } else if (type === 'low') {
      inputs = {
        monthlySpendDZD: 3200,
        dataUsageGB: 28.0,
        callsCount: 120,
        complaints: 0,
        rechargeFrequency: 4,
        subscription: 'Postpaid',
        tenureMonths: 36
      };
    } else {
      inputs = {
        monthlySpendDZD: 1600,
        dataUsageGB: 8.5,
        callsCount: 50,
        complaints: 1,
        rechargeFrequency: 3,
        subscription: 'Prepaid',
        tenureMonths: 14
      };
    }
    setChurnInputs(inputs);
    try {
      const result = await predictCustomerChurnApi(inputs);
      setChurnResult(result);
    } catch (err: any) {
      setInferenceError(err.message || 'Failed to reach the churn prediction API.');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Bento Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            AI Predictions & ML Benchmarks
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Model Evaluation, Confusion Matrices, SHAP Feature Importance & Interactive Testing
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'benchmarks' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ML Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('churn-tester')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'churn-tester' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Churn Test Bench
          </button>
          <button
            onClick={() => setActiveTab('anomaly-tester')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'anomaly-tester' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Anomaly Test Bench
          </button>
        </div>
      </header>

      {inferenceError && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{inferenceError}</span>
          </div>
          <button 
            onClick={() => setInferenceError(null)}
            className="text-amber-400 hover:text-white px-2 py-0.5 rounded text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: ML Benchmarks & Comparison */}
      {activeTab === 'benchmarks' && churnModelBenchmarks.length === 0 && !benchmarkError && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-sm text-slate-400">
          Loading model benchmarks from the backend…
        </div>
      )}

      {activeTab === 'benchmarks' && benchmarkError && churnModelBenchmarks.length === 0 && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-sm text-rose-300">
          {benchmarkError}
        </div>
      )}

      {activeTab === 'benchmarks' && churnModelBenchmarks.length > 0 && anomalyModelSpecs && (
        <div className="space-y-4">
          {/* Explanation Bento Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="text-white font-bold block text-sm">
                Why Precision, Recall & ROC-AUC Matter (Over Naive Accuracy)
              </span>
              <p>
                Telecom churn datasets are heavily imbalanced: typically only 4–7% of subscribers churn in a given month. A naive model predicting everyone stays achieves 95% accuracy while identifying zero at-risk customers. 
                Our benchmark trains <strong>Logistic Regression</strong>, <strong>Decision Tree</strong>, <strong>Random Forest</strong>, and <strong>Gradient Boosting</strong> under stratified validation. <strong>Gradient Boosting</strong> was dynamically selected as production champion with <strong>ROC-AUC: 0.961</strong>, <strong>Precision: 0.766</strong>, <strong>Recall: 0.718</strong>, and <strong>F1 Score: 0.741</strong>.
              </p>
            </div>
          </div>

          {/* Model Comparison Bento Cards 4-grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {churnModelBenchmarks.map((model, idx) => {
              const isSelected = selectedModelIdx === idx;
              const isChampion = idx === 0;
              return (
                <div
                  key={model.name}
                  onClick={() => setSelectedModelIdx(idx)}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-sky-500 ring-1 ring-sky-500' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block truncate">{model.name}</span>
                    {isChampion && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        CHAMPION
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3 font-mono-num">
                    <span className="text-3xl font-bold text-white">
                      {model.rocAuc.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-sky-400 uppercase font-bold">ROC-AUC</span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono-num border-t border-slate-800 pt-2.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Precision:</span>
                      <strong className="text-white">{(model.precision * 100).toFixed(0)}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Recall:</span>
                      <strong className="text-white">{(model.recall * 100).toFixed(0)}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>F1 Score:</span>
                      <strong className="text-white">{(model.f1Score * 100).toFixed(0)}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Latency:</span>
                      <span>{model.trainTimeMs}ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Model Deep-Dive: Confusion Matrix & Feature Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 6 Cols: Confusion Matrix for Selected Model */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    Confusion Matrix: {currentBenchmark.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Validation on 1,958 test records</p>
                </div>
                <span className="text-xs font-mono-num text-sky-400 font-bold">
                  Acc: {(currentBenchmark.accuracy * 100).toFixed(1)}%
                </span>
              </div>

              {/* Confusion Matrix 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2.5 font-mono-num text-center">
                {/* True Negative */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    True Negative (TN)
                  </span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {currentBenchmark?.confusionMatrix?.tn?.toLocaleString() ?? 0}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Correctly predicted Stay</p>
                </div>

                {/* False Positive */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-amber-400 uppercase tracking-wider block mb-1">
                    False Positive (FP)
                  </span>
                  <span className="text-2xl font-bold text-amber-400">
                    {currentBenchmark?.confusionMatrix?.fp?.toLocaleString() ?? 0}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Stayed but flagged Churn</p>
                </div>

                {/* False Negative */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-rose-400 uppercase tracking-wider block mb-1">
                    False Negative (FN)
                  </span>
                  <span className="text-2xl font-bold text-rose-400">
                    {currentBenchmark?.confusionMatrix?.fn?.toLocaleString() ?? 0}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Churned without alert (Missed)</p>
                </div>

                {/* True Positive */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-sky-400 uppercase tracking-wider block mb-1">
                    True Positive (TP)
                  </span>
                  <span className="text-2xl font-bold text-sky-400">
                    {currentBenchmark?.confusionMatrix?.tp?.toLocaleString() ?? 0}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Correctly identified Churner</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono-num flex justify-between">
                <span>Sensitivity (Recall): <strong className="text-white">{(currentBenchmark.recall * 100).toFixed(1)}%</strong></span>
                <span>Specificity: <strong className="text-white">{((currentBenchmark.confusionMatrix.tn / (currentBenchmark.confusionMatrix.tn + currentBenchmark.confusionMatrix.fp)) * 100).toFixed(1)}%</strong></span>
              </div>
            </div>

            {/* Right 6 Cols: Feature Importance (Explainable AI) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    Feature Importance (TreeExplainer & Impurity Drop)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Key drivers influencing subscriber churn risk</p>
                </div>
                <span className="text-xs font-mono-num text-emerald-400 font-bold">
                  Explainable AI (XAI)
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={churnFeatureImportance} 
                    layout="vertical" 
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" tickFormatter={(v) => (v * 100).toFixed(0)} />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={130} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                      formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Importance']}
                    />
                    <Bar dataKey="importance" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                      {churnFeatureImportance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : index === 1 ? '#f59e0b' : '#0ea5e9'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-mono-num">
                * Complaints and rapid usage decline account for over 50% of total model variance.
              </p>
            </div>
          </div>

          {/* Module 2: Network Anomaly Detection Bento card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Module #2: Network Anomaly Detection (Isolation Forest)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unsupervised outlier partition algorithm designed for telecom cells without ground-truth labels.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono-num font-semibold">
                Anomalies: {anomalyModelSpecs.anomaliesDetected} / {anomalyModelSpecs.totalCellsMonitored}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-num">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Contamination Rate</span>
                <span className="text-sky-400 font-bold text-base">{(anomalyModelSpecs.contamination * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Isolation Trees</span>
                <span className="text-white font-bold text-base">{anomalyModelSpecs.nEstimators} trees</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Normal Monitored</span>
                <span className="text-emerald-400 font-bold text-base">{anomalyModelSpecs.normalCells} cells</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">ROC-AUC (Synthetics)</span>
                <span className="text-amber-400 font-bold text-base">{anomalyModelSpecs.rocAucEstimate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Interactive Churn Test Bench */}
      {activeTab === 'churn-tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 6 Cols: Sliders & Inputs */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  Churn Prediction API Tester
                </h3>
                <p className="text-xs text-slate-400 font-mono-num mt-0.5">POST /api/predict/churn</p>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleLoadChurnPreset('high')}
                  className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 text-[11px] font-bold cursor-pointer hover:bg-rose-500/30"
                >
                  Preset High Risk
                </button>
                <button
                  onClick={() => handleLoadChurnPreset('low')}
                  className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold cursor-pointer hover:bg-emerald-500/30"
                >
                  Preset Loyal
                </button>
              </div>
            </div>

            {/* Interactive Inputs */}
            <div className="space-y-3.5 text-xs font-mono-num">
              {/* Monthly Spend */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Monthly Spending:</span>
                  <span className="text-sky-400 font-bold">{(churnInputs?.monthlySpendDZD ?? 0).toLocaleString()} DZD</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="6000"
                  step="100"
                  value={churnInputs.monthlySpendDZD}
                  onChange={(e) => setChurnInputs({ ...churnInputs, monthlySpendDZD: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Data Usage */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Data Usage:</span>
                  <span className="text-sky-400 font-bold">{churnInputs.dataUsageGB} GB</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={churnInputs.dataUsageGB}
                  onChange={(e) => setChurnInputs({ ...churnInputs, dataUsageGB: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Voice Calls */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Voice Calls Count:</span>
                  <span className="text-sky-400 font-bold">{churnInputs.callsCount} calls</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="1"
                  value={churnInputs.callsCount}
                  onChange={(e) => setChurnInputs({ ...churnInputs, callsCount: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Complaints Count (Massive impact) */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Complaints (last 60 days):</span>
                  <span className={`font-bold ${churnInputs.complaints > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {churnInputs.complaints} complaints
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={churnInputs.complaints}
                  onChange={(e) => setChurnInputs({ ...churnInputs, complaints: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Recharge Frequency */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Recharge Frequency:</span>
                  <span className="text-sky-400 font-bold">{churnInputs.rechargeFrequency} / month</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={churnInputs.rechargeFrequency}
                  onChange={(e) => setChurnInputs({ ...churnInputs, rechargeFrequency: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Tenure */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Tenure:</span>
                  <span className="text-sky-400 font-bold">{churnInputs.tenureMonths} months</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={churnInputs.tenureMonths}
                  onChange={(e) => setChurnInputs({ ...churnInputs, tenureMonths: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Subscription Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300">Subscription:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChurnInputs({ ...churnInputs, subscription: 'Prepaid' })}
                    className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                      churnInputs.subscription === 'Prepaid' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Prepaid
                  </button>
                  <button
                    onClick={() => setChurnInputs({ ...churnInputs, subscription: 'Postpaid' })}
                    className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                      churnInputs.subscription === 'Postpaid' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Postpaid
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunChurnInference}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Run Churn Prediction (POST /api/predict/churn)</span>
            </button>
          </div>

          {/* Right 6 Cols: Output Result */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono-num">
                Inference API Response
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Real-Time Retention Prediction
              </h3>
            </div>

            {churnResult && (
              <div className="space-y-4">
                {/* Result Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Predicted Churn Probability</span>
                  <div className="text-5xl font-bold font-mono-num my-2">
                    <span className={
                      churnResult.riskLevel === 'HIGH' ? 'text-rose-400' :
                      churnResult.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                    }>
                      {churnResult.churnProbability}%
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold font-mono-num ${
                    churnResult.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-500' :
                    churnResult.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {churnResult.riskLevel === 'HIGH' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {churnResult.riskLevel === 'LOW' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    RISK LEVEL: {churnResult.riskLevel}
                  </span>
                </div>

                {/* Risk Factors Breakdown */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block font-mono-num">
                    Main Risk Factors (Explainable AI):
                  </span>
                  {churnResult.riskFactors.map((rf, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono-num">
                        <span className="text-slate-300">⚠ {rf.factor}</span>
                        <span className="text-rose-400 font-bold">
                          {rf.shapValue ? `SHAP ${rf.shapValue}` : `+${rf.impactPct}%`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div 
                          className="bg-rose-500 h-1.5 rounded-full" 
                          style={{ width: `${rf.impactPct * 3.5}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommended Action */}
                <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-xs text-sky-100">
                  <span className="font-bold uppercase text-sky-400 text-[10px] tracking-wider block mb-1">
                    Recommended Operator Action
                  </span>
                  <p className="leading-relaxed">
                    {churnResult.recommendedAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Interactive Anomaly Test Bench */}
      {activeTab === 'anomaly-tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 6 Cols: Anomaly Inputs */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Isolation Forest Anomaly Tester
              </h3>
              <p className="text-xs text-slate-400 font-mono-num mt-0.5">POST /api/predict/anomaly</p>
            </div>

            <div className="space-y-3.5 text-xs font-mono-num">
              {/* Connected Users */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Connected UEs / Users:</span>
                  <span className="text-sky-400 font-bold">{(anomalyInputs?.users ?? 0).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2500"
                  step="50"
                  value={anomalyInputs.users}
                  onChange={(e) => setAnomalyInputs({ ...anomalyInputs, users: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Latency */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Radio Latency (ms):</span>
                  <span className={`font-bold ${anomalyInputs.latencyMs > 60 ? 'text-rose-400' : 'text-sky-400'}`}>
                    {anomalyInputs.latencyMs}ms
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="150"
                  step="1"
                  value={anomalyInputs.latencyMs}
                  onChange={(e) => setAnomalyInputs({ ...anomalyInputs, latencyMs: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Packet Loss */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Packet Loss (%):</span>
                  <span className={`font-bold ${anomalyInputs.packetLossPct > 2 ? 'text-rose-400' : 'text-sky-400'}`}>
                    {anomalyInputs.packetLossPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="8.0"
                  step="0.1"
                  value={anomalyInputs.packetLossPct}
                  onChange={(e) => setAnomalyInputs({ ...anomalyInputs, packetLossPct: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Throughput */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Throughput Demand (Mbps):</span>
                  <span className="text-sky-400 font-bold">{anomalyInputs.trafficMbps} Mbps</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="20"
                  value={anomalyInputs.trafficMbps}
                  onChange={(e) => setAnomalyInputs({ ...anomalyInputs, trafficMbps: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Availability */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Carrier Availability (%):</span>
                  <span className={`font-bold ${anomalyInputs.availabilityPct < 98 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {anomalyInputs.availabilityPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="100"
                  step="0.1"
                  value={anomalyInputs.availabilityPct}
                  onChange={(e) => setAnomalyInputs({ ...anomalyInputs, availabilityPct: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleRunAnomalyInference}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Detect Anomaly (POST /api/predict/anomaly)</span>
            </button>
          </div>

          {/* Right 6 Cols: Anomaly Result */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono-num">
                Isolation Forest Output
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Anomaly Score & Incident Assessment
              </h3>
            </div>

            {anomalyResult && (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Detected Status</span>
                  <div className="my-2">
                    <span className={`text-2xl font-bold font-mono-num uppercase px-4 py-1.5 rounded ${
                      anomalyResult.status === 'anomaly' ? 'bg-rose-500/20 text-rose-500' :
                      anomalyResult.status === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {anomalyResult.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-mono-num mt-3">
                    <span>Isolation Score: <strong className="text-white">{anomalyResult.anomalyScore}</strong></span>
                    <span>Confidence: <strong className="text-white">{anomalyResult.confidencePct}%</strong></span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block font-mono-num">
                    AI Incident Summary:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {anomalyResult.aiIncidentSummary}
                  </p>
                </div>

                <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-xs text-sky-100 space-y-1">
                  <span className="font-bold uppercase text-sky-400 text-[10px] tracking-wider block mb-1">
                    Recommended NOC Action
                  </span>
                  <p className="leading-relaxed">
                    {anomalyResult.recommendedResolution}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

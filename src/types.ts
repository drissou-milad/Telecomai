export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type CellStatus = 'normal' | 'warning' | 'anomaly';
export type UserRole = 'Admin' | 'Analyst';
export type SubscriptionType = 'Prepaid' | 'Postpaid';
export type ContractType = 'Month-to-month' | 'One year' | 'Two year';
export type InternetType = '4G LTE' | '5G NR' | 'Fiber optic' | 'DSL';

export interface RiskFactor {
  factor: string;
  impactPct: number;
  description: string;
  shapValue?: string;
}

export interface Customer {
  id: string;
  name: string;
  wilaya: string;
  monthlySpendDZD: number;
  dataUsageGB: number;
  callsCount: number;
  complaints: number;
  rechargeFrequency: number;
  subscription: SubscriptionType;
  tenureMonths: number;
  usageDeclinePct: number;
  contractType: ContractType;
  internetService: InternetType;
  paymentMethod: string;
  churnProbability: number; // 0 - 100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendedAction: string;
  lastActiveDate: string;
  phoneNumber: string;
}

export interface NetworkCell {
  cellId: string;
  siteName: string;
  wilaya: string;
  technology: '4G LTE' | '5G NR' | '3G';
  users: number;
  latencyMs: number;
  packetLossPct: number;
  trafficMbps: number;
  availabilityPct: number;
  jitterMs: number;
  status: CellStatus;
  anomalyScore: number; // -1.0 to 1.0 (Isolation Forest style: lower/negative = anomaly)
  anomalyConfidence: number; // 0 - 100
  possibleCauses: string[];
  aiIncidentSummary: string;
  lastAlarmTime: string;
  baselineLatency: number;
  baselineTraffic: number;
}

export interface ModelComparison {
  name: string;
  displayName?: string;
  isChampion?: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  trainTimeMs: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  category: 'behavior' | 'billing' | 'tenure' | 'service';
}

export interface WilayaHealth {
  wilaya: string;
  healthPct: number;
  activeCells: number;
  anomalies: number;
  activeUsers: number;
  avgLatencyMs: number;
  avgPacketLossPct: number;
}

export interface TrafficForecastPoint {
  time: string;
  todayActual: number;
  predictedTomorrow: number;
  baseline: number;
}

export interface TelemetryTrendPoint {
  time: string;
  latency: number;
  packetLoss: number;
  jitter: number;
  throughput: number;
}

export interface DashboardSummary {
  networkHealth: number;
  activeUsers: number;
  highRiskCustomers: number;
  mediumRiskCustomers: number;
  totalCustomersScored: number;
  churnRatePct: number;
  averageChurnProbabilityPct: number;
  networkAnomalies: number;
  revenueAtRiskDZD: number;
  averageLatencyMs: number;
  packetLossAvgPct: number;
  totalCellsMonitored: number;
}

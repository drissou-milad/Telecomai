import {
  Customer,
  NetworkCell,
  WilayaHealth,
  TrafficForecastPoint,
  TelemetryTrendPoint,
  DashboardSummary
} from '../types';
// Placeholder shown only until the real summary loads from GET /api/dashboard/summary
// (computed by scoring the full synthetic dataset with the trained models - see
// backend/app/services/dashboard_service.py). Never treat these as real numbers.
export const LOADING_DASHBOARD_SUMMARY: DashboardSummary = {
  networkHealth: 0,
  activeUsers: 0,
  highRiskCustomers: 0,
  mediumRiskCustomers: 0,
  totalCustomersScored: 0,
  churnRatePct: 0,
  averageChurnProbabilityPct: 0,
  networkAnomalies: 0,
  revenueAtRiskDZD: 0,
  averageLatencyMs: 0,
  packetLossAvgPct: 0,
  totalCellsMonitored: 0
};

// SYNTHETIC regional traffic simulation for demo/illustrative purposes only.
// These per-wilaya figures are NOT real Algerian operator statistics - they are
// hand-authored to give the regional health view plausible, varied demo data.
// The dataset-derived KPIs (activeUsers, revenueAtRiskDZD, etc. in
// LOADING_DASHBOARD_SUMMARY / GET /api/dashboard/summary) are the real, model-computed numbers.
export const SYNTHETIC_WILAYA_SIMULATION: WilayaHealth[] = [
  {
    wilaya: 'Algiers',
    healthPct: 96.1,
    activeCells: 340,
    anomalies: 6,
    activeUsers: 890000,
    avgLatencyMs: 27.2,
    avgPacketLossPct: 0.45
  },
  {
    wilaya: 'Oran',
    healthPct: 94.8,
    activeCells: 185,
    anomalies: 5,
    activeUsers: 420000,
    avgLatencyMs: 31.8,
    avgPacketLossPct: 0.68
  },
  {
    wilaya: 'Constantine',
    healthPct: 95.3,
    activeCells: 120,
    anomalies: 3,
    activeUsers: 310000,
    avgLatencyMs: 29.5,
    avgPacketLossPct: 0.52
  },
  {
    wilaya: 'Tlemcen',
    healthPct: 92.7,
    activeCells: 88,
    anomalies: 8,
    activeUsers: 195000,
    avgLatencyMs: 44.1,
    avgPacketLossPct: 1.85
  },
  {
    wilaya: 'Sétif',
    healthPct: 93.9,
    activeCells: 95,
    anomalies: 4,
    activeUsers: 245000,
    avgLatencyMs: 33.6,
    avgPacketLossPct: 0.94
  },
  {
    wilaya: 'Annaba',
    healthPct: 95.1,
    activeCells: 74,
    anomalies: 2,
    activeUsers: 180000,
    avgLatencyMs: 30.1,
    avgPacketLossPct: 0.58
  },
  {
    wilaya: 'Blida',
    healthPct: 94.2,
    activeCells: 62,
    anomalies: 5,
    activeUsers: 125000,
    avgLatencyMs: 34.2,
    avgPacketLossPct: 0.89
  },
  {
    wilaya: 'Batna',
    healthPct: 93.5,
    activeCells: 36,
    anomalies: 4,
    activeUsers: 65000,
    avgLatencyMs: 38.7,
    avgPacketLossPct: 1.12
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  // Fictional demo customers for the interactive drill-down UI - not real subscribers.
  {
    id: 'C10245',
    name: 'Karim Bouzid',
    wilaya: 'Algiers',
    monthlySpendDZD: 1800,
    dataUsageGB: 4.2,
    callsCount: 34,
    complaints: 3,
    rechargeFrequency: 2,
    subscription: 'Prepaid',
    tenureMonths: 8,
    usageDeclinePct: 27,
    contractType: 'Month-to-month',
    internetService: '4G LTE',
    paymentMethod: 'Post Office Dahabia',
    churnProbability: 78,
    riskLevel: 'HIGH',
    riskFactors: [
      { factor: 'Customer Service Complaints (60d)', impactPct: 24, shapValue: '+0.24', description: '3 complaints regarding network congestion during peak hours' },
      { factor: 'Usage Decline Rate (% MoM)', impactPct: 19, shapValue: '+0.19', description: 'Data consumption declined 27% compared to previous quarter' },
      { factor: 'Subscriber Tenure (Months)', impactPct: 13, shapValue: '+0.13', description: 'Only 8 months with operator; low switching barrier' },
      { factor: 'Recharge Replenishment Freq', impactPct: 8, shapValue: '+0.08', description: 'Only 2 recharges per month' }
    ],
    recommendedAction: 'Recommended retention action: Consider a personalized data/loyalty offer and proactive customer-care intervention. Example intervention: 15 GB retention bonus.',
    lastActiveDate: 'Today, 09:15',
    phoneNumber: '+213 550 12 34 56'
  },
  {
    id: 'C10246',
    name: 'Amina Mansouri',
    wilaya: 'Oran',
    monthlySpendDZD: 3200,
    dataUsageGB: 28.5,
    callsCount: 142,
    complaints: 0,
    rechargeFrequency: 4,
    subscription: 'Postpaid',
    tenureMonths: 36,
    usageDeclinePct: 2,
    contractType: 'Two year',
    internetService: '5G NR',
    paymentMethod: 'Electronic / CIB',
    churnProbability: 8,
    riskLevel: 'LOW',
    riskFactors: [
      { factor: 'High Loyalty Tenure', impactPct: -15, description: 'Long term subscriber for 36 months' },
      { factor: 'Consistent Usage', impactPct: -10, description: 'Active data usage and prompt payments' }
    ],
    recommendedAction: 'Customer is highly loyal. Qualify for 5G Premium VIP privilege tier and annual loyalty anniversary bonus.',
    lastActiveDate: 'Today, 11:30',
    phoneNumber: '+213 661 45 88 90'
  },
  {
    id: 'C10247',
    name: 'Yassine Belhadj',
    wilaya: 'Tlemcen',
    monthlySpendDZD: 2100,
    dataUsageGB: 5.1,
    callsCount: 22,
    complaints: 4,
    rechargeFrequency: 1,
    subscription: 'Prepaid',
    tenureMonths: 6,
    usageDeclinePct: 38,
    contractType: 'Month-to-month',
    internetService: '4G LTE',
    paymentMethod: 'Cash / Agency',
    churnProbability: 85,
    riskLevel: 'HIGH',
    riskFactors: [
      { factor: 'Critical Complaints', impactPct: 28, description: '4 dropped call complaints in Tlemcen sector CELL-TLM-034' },
      { factor: 'Severe Usage Drop', impactPct: 24, description: 'Data usage fell 38% after network incidents' },
      { factor: 'Single Recharge/Month', impactPct: 15, description: 'Prepaid recharge cadence drastically slowed' }
    ],
    recommendedAction: 'Immediate network credit refund (500 DZD) + apology SMS regarding Cell TLM-034 maintenance + 20GB retention pass.',
    lastActiveDate: 'Yesterday, 18:40',
    phoneNumber: '+213 770 99 11 22'
  },
  {
    id: 'C10248',
    name: 'Fatima Zohra Khelifi',
    wilaya: 'Constantine',
    monthlySpendDZD: 1500,
    dataUsageGB: 9.8,
    callsCount: 65,
    complaints: 1,
    rechargeFrequency: 3,
    subscription: 'Prepaid',
    tenureMonths: 16,
    usageDeclinePct: 12,
    contractType: 'Month-to-month',
    internetService: '4G LTE',
    paymentMethod: 'Post Office Dahabia',
    churnProbability: 42,
    riskLevel: 'MEDIUM',
    riskFactors: [
      { factor: 'Moderate Usage Drop', impactPct: 14, description: 'Slight decline in weekday streaming' },
      { factor: 'Single Billing Query', impactPct: 10, description: 'Inquired about international roaming tariff' }
    ],
    recommendedAction: 'Recommended retention action: Send targeted Weekend Data Booster promotional notification. Example intervention: 10GB bonus bundle.',
    lastActiveDate: 'Today, 08:20',
    phoneNumber: '+213 555 33 22 11'
  },
  {
    id: 'C10249',
    name: 'Mohamed Salah Touati',
    wilaya: 'Sétif',
    monthlySpendDZD: 2600,
    dataUsageGB: 18.0,
    callsCount: 95,
    complaints: 1,
    rechargeFrequency: 3,
    subscription: 'Postpaid',
    tenureMonths: 22,
    usageDeclinePct: 5,
    contractType: 'One year',
    internetService: 'Fiber optic',
    paymentMethod: 'Electronic / CIB',
    churnProbability: 24,
    riskLevel: 'LOW',
    riskFactors: [
      { factor: 'Stable Postpaid Account', impactPct: -8, description: 'Reliable monthly auto-billing' }
    ],
    recommendedAction: 'Cross-sell fiber-to-the-home bundled family SIM addon with 15% discount.',
    lastActiveDate: 'Today, 10:05',
    phoneNumber: '+213 662 77 44 33'
  },
  {
    id: 'C10250',
    name: 'Nadia Chaouch',
    wilaya: 'Annaba',
    monthlySpendDZD: 1950,
    dataUsageGB: 3.8,
    callsCount: 19,
    complaints: 2,
    rechargeFrequency: 2,
    subscription: 'Prepaid',
    tenureMonths: 9,
    usageDeclinePct: 31,
    contractType: 'Month-to-month',
    internetService: '4G LTE',
    paymentMethod: 'Cash / Agency',
    churnProbability: 73,
    riskLevel: 'HIGH',
    riskFactors: [
      { factor: 'Multiple Complaints', impactPct: 21, description: '2 complaints regarding 4G speeds in coastal zone' },
      { factor: 'Sharp Consumption Decline', impactPct: 19, description: '31% drop in MB consumed' },
      { factor: 'Short Tenure', impactPct: 13, description: '9 months tenure' }
    ],
    recommendedAction: 'Send retention survey with instant 10GB apology data bundle and priority tech support check.',
    lastActiveDate: '3 days ago',
    phoneNumber: '+213 771 88 55 22'
  },
  {
    id: 'C10251',
    name: 'Sofiane Merzoug',
    wilaya: 'Blida',
    monthlySpendDZD: 1400,
    dataUsageGB: 7.5,
    callsCount: 48,
    complaints: 1,
    rechargeFrequency: 2,
    subscription: 'Prepaid',
    tenureMonths: 14,
    usageDeclinePct: 18,
    contractType: 'Month-to-month',
    internetService: '4G LTE',
    paymentMethod: 'Post Office Dahabia',
    churnProbability: 49,
    riskLevel: 'MEDIUM',
    riskFactors: [
      { factor: 'Usage Softness', impactPct: 15, description: 'Recharge interval stretched from 12 days to 18 days' }
    ],
    recommendedAction: 'Provide mid-cycle recharge incentive: 3GB bonus if reloaded before Sunday.',
    lastActiveDate: 'Yesterday, 14:10',
    phoneNumber: '+213 552 90 12 34'
  },
  {
    id: 'C10252',
    name: 'Leila Benali',
    wilaya: 'Batna',
    monthlySpendDZD: 3800,
    dataUsageGB: 34.0,
    callsCount: 180,
    complaints: 0,
    rechargeFrequency: 5,
    subscription: 'Postpaid',
    tenureMonths: 48,
    usageDeclinePct: 0,
    contractType: 'Two year',
    internetService: '5G NR',
    paymentMethod: 'Electronic / CIB',
    churnProbability: 5,
    riskLevel: 'LOW',
    riskFactors: [
      { factor: 'High ARPU & Loyalty', impactPct: -25, description: 'Top 5% revenue generator with 4 years tenure' }
    ],
    recommendedAction: 'Account is in prime health. Maintain white-glove executive care.',
    lastActiveDate: 'Today, 11:45',
    phoneNumber: '+213 663 11 00 22'
  }
];

export const INITIAL_CELLS: NetworkCell[] = [
  // Cells explicitly highlighted in prompt section 4 & 8 & 18:
  {
    cellId: 'CELL-001',
    siteName: 'Algiers Port Maritime',
    wilaya: 'Algiers',
    technology: '5G NR',
    users: 842,
    latencyMs: 31,
    packetLossPct: 0.4,
    trafficMbps: 421,
    availabilityPct: 99.8,
    jitterMs: 3.2,
    status: 'normal',
    anomalyScore: 0.48,
    anomalyConfidence: 94,
    possibleCauses: ['Nominal 5G beamforming operation', 'Optimal backhaul throughput'],
    aiIncidentSummary: 'Cell CELL-001 is operating within SLA bounds. Radio link delay is low at 31ms and carrier availability remains at 99.8%.',
    lastAlarmTime: 'None (Clear)',
    baselineLatency: 30,
    baselineTraffic: 400
  },
  {
    cellId: 'CELL-002',
    siteName: 'Oran Front de Mer',
    wilaya: 'Oran',
    technology: '4G LTE',
    users: 921,
    latencyMs: 34,
    packetLossPct: 0.8,
    trafficMbps: 512,
    availabilityPct: 99.6,
    jitterMs: 4.1,
    status: 'normal',
    anomalyScore: 0.41,
    anomalyConfidence: 91,
    possibleCauses: ['Stable LTE carrier aggregation', 'Healthy cell boundary handovers'],
    aiIncidentSummary: 'Cell CELL-002 is operating normally. Traffic load is aligned with weekday afternoon profile.',
    lastAlarmTime: 'None (Clear)',
    baselineLatency: 32,
    baselineTraffic: 480
  },
  {
    cellId: 'CELL-003',
    siteName: 'Bab Ezzouar Business Park',
    wilaya: 'Algiers',
    technology: '4G LTE',
    users: 1942,
    latencyMs: 97,
    packetLossPct: 4.8,
    trafficMbps: 982,
    availabilityPct: 96.2,
    jitterMs: 18.5,
    status: 'anomaly',
    anomalyScore: -0.42,
    anomalyConfidence: 93,
    possibleCauses: [
      'Unusual traffic surge (+85% above baseline)',
      'Radio resource block (PRB) congestion (>94% utilization)',
      'Severe packet drop rate (4.8% vs 0.5% SLA)'
    ],
    aiIncidentSummary: 'Cell CELL-003 is experiencing severe RF congestion and transport degradation. The primary indicators are latency spikes (97ms), packet loss (4.8%) and heavy user crowding (1,942 UEs). AI Recommended Action: Investigate congestion and evaluate traffic redistribution to neighboring cells.',
    lastAlarmTime: '12 minutes ago (Major)',
    baselineLatency: 32,
    baselineTraffic: 520
  },
  {
    cellId: 'CELL-004',
    siteName: 'Constantine Cirta Historic',
    wilaya: 'Constantine',
    technology: '4G LTE',
    users: 711,
    latencyMs: 29,
    packetLossPct: 0.3,
    trafficMbps: 380,
    availabilityPct: 99.9,
    jitterMs: 2.8,
    status: 'normal',
    anomalyScore: 0.52,
    anomalyConfidence: 96,
    possibleCauses: ['Nominal cell throughput', 'Clear microwave link path'],
    aiIncidentSummary: 'Cell CELL-004 exhibits optimal KPI performance with pristine availability at 99.9%.',
    lastAlarmTime: 'None (Clear)',
    baselineLatency: 30,
    baselineTraffic: 390
  },
  {
    cellId: 'CELL-A001',
    siteName: 'Didouche Mourad Central',
    wilaya: 'Algiers',
    technology: '5G NR',
    users: 812,
    latencyMs: 28,
    packetLossPct: 0.4,
    trafficMbps: 450,
    availabilityPct: 99.7,
    jitterMs: 3.0,
    status: 'normal',
    anomalyScore: 0.49,
    anomalyConfidence: 95,
    possibleCauses: ['Standard suburban load'],
    aiIncidentSummary: 'Operating normally with high downlink speeds.',
    lastAlarmTime: 'None (Clear)',
    baselineLatency: 28,
    baselineTraffic: 430
  },
  {
    cellId: 'CELL-A002',
    siteName: 'Es Senia University Pole',
    wilaya: 'Oran',
    technology: '4G LTE',
    users: 921,
    latencyMs: 35,
    packetLossPct: 0.7,
    trafficMbps: 540,
    availabilityPct: 99.4,
    jitterMs: 4.5,
    status: 'normal',
    anomalyScore: 0.38,
    anomalyConfidence: 89,
    possibleCauses: ['Student campus traffic demand in normal range'],
    aiIncidentSummary: 'Cell performance within expected parameters.',
    lastAlarmTime: 'None (Clear)',
    baselineLatency: 33,
    baselineTraffic: 510
  },
  {
    cellId: 'CELL-A003',
    siteName: 'Hydra Commercial Hub',
    wilaya: 'Algiers',
    technology: '5G NR',
    users: 1942,
    latencyMs: 91,
    packetLossPct: 4.2,
    trafficMbps: 950,
    availabilityPct: 96.5,
    jitterMs: 16.8,
    status: 'anomaly',
    anomalyScore: -0.38,
    anomalyConfidence: 91,
    possibleCauses: [
      'Unusual traffic (+74% surge)',
      'Elevated transport latency (91ms)',
      'Backhaul link buffer saturation'
    ],
    aiIncidentSummary: 'Cell CELL-A003 anomaly detected with 91% confidence. Reason: Unusual traffic + latency increase. AI Recommended Action: Investigate radio congestion and evaluate traffic redistribution to neighboring cells.',
    lastAlarmTime: '8 minutes ago (Major)',
    baselineLatency: 31,
    baselineTraffic: 510
  },
  {
    cellId: 'CELL-A004',
    siteName: 'Ain El Turk Coastal',
    wilaya: 'Oran',
    technology: '4G LTE',
    users: 711,
    latencyMs: 31,
    packetLossPct: 0.5,
    trafficMbps: 410,
    availabilityPct: 99.8,
    jitterMs: 3.5,
    status: 'normal',
    anomalyScore: 0.46,
    anomalyConfidence: 93,
    possibleCauses: ['Nominal cell throughput'],
    aiIncidentSummary: 'Healthy radio transmission and clear signal-to-noise ratio.',
    lastAlarmTime: 'None (Clear)',
    baselineLatency: 30,
    baselineTraffic: 400
  },
  {
    cellId: 'CELL-A005',
    siteName: 'El Eulma Commercial Center',
    wilaya: 'Sétif',
    technology: '4G LTE',
    users: 1432,
    latencyMs: 64,
    packetLossPct: 2.1,
    trafficMbps: 790,
    availabilityPct: 98.1,
    jitterMs: 9.4,
    status: 'warning',
    anomalyScore: 0.12,
    anomalyConfidence: 78,
    possibleCauses: [
      'Approaching PRB capacity limits (>82%)',
      'Intermittent packet delay variation'
    ],
    aiIncidentSummary: 'Cell CELL-A005 exhibits warning threshold indicators. Traffic is surging due to market peak activity. Monitoring active.',
    lastAlarmTime: '24 minutes ago (Minor)',
    baselineLatency: 34,
    baselineTraffic: 620
  },
  // Exact feature from prompt section 18:
  {
    cellId: 'CELL-TLM-034',
    siteName: 'Mansourah Citadel Tower',
    wilaya: 'Tlemcen',
    technology: '4G LTE',
    users: 1840,
    latencyMs: 112, // +182%
    packetLossPct: 5.2, // +340%
    trafficMbps: 890, // +87%
    availabilityPct: 94.8,
    jitterMs: 24.1,
    status: 'anomaly',
    anomalyScore: -0.58,
    anomalyConfidence: 95,
    possibleCauses: [
      'Latency surge (+182% vs baseline 38ms)',
      'Critical packet loss (+340% spike)',
      'Abnormal traffic growth (+87%)',
      'Fiber backhaul interface CRC framing errors'
    ],
    aiIncidentSummary: 'Cell TLM-034 is experiencing significant network degradation. The primary indicators are increased latency, packet loss and abnormal traffic growth. The system recommends investigating possible congestion or infrastructure degradation.',
    lastAlarmTime: '4 minutes ago (Critical)',
    baselineLatency: 38,
    baselineTraffic: 470
  }
];

// 24-Hour Traffic Forecasting curve (Today Actual vs Tomorrow Predicted)
// Highlighted in prompt section 16
export const TRAFFIC_FORECAST_DATA: TrafficForecastPoint[] = [
  { time: '00:00', todayActual: 180, predictedTomorrow: 175, baseline: 170 },
  { time: '02:00', todayActual: 110, predictedTomorrow: 105, baseline: 100 },
  { time: '04:00', todayActual: 85,  predictedTomorrow: 80,  baseline: 80 },
  { time: '06:00', todayActual: 140, predictedTomorrow: 150, baseline: 135 },
  { time: '08:00', todayActual: 420, predictedTomorrow: 440, baseline: 410 },
  { time: '10:00', todayActual: 680, predictedTomorrow: 710, baseline: 660 },
  { time: '12:00', todayActual: 890, predictedTomorrow: 930, baseline: 870 },
  { time: '14:00', todayActual: 760, predictedTomorrow: 810, baseline: 750 },
  { time: '16:00', todayActual: 940, predictedTomorrow: 990, baseline: 920 },
  { time: '18:00', todayActual: 980, predictedTomorrow: 1040, baseline: 960 },
  { time: '20:00', todayActual: 1020, predictedTomorrow: 1080, baseline: 1000 },
  { time: '22:00', todayActual: 620, predictedTomorrow: 640, baseline: 600 }
];

// Telemetry Timeline Data for NOC monitoring charts (similar to uploaded images)
export const NOC_TELEMETRY_SERIES: TelemetryTrendPoint[] = [
  { time: '08:00', latency: 29.4, packetLoss: 0.38, jitter: 3.1, throughput: 14.8 },
  { time: '09:00', latency: 31.2, packetLoss: 0.42, jitter: 3.4, throughput: 15.6 },
  { time: '10:00', latency: 33.8, packetLoss: 0.55, jitter: 3.9, throughput: 16.9 },
  { time: '11:00', latency: 38.5, packetLoss: 0.89, jitter: 4.8, throughput: 17.8 },
  { time: '12:00', latency: 45.1, packetLoss: 1.45, jitter: 6.2, throughput: 18.4 },
  { time: '13:00', latency: 42.0, packetLoss: 1.10, jitter: 5.4, throughput: 17.5 },
  { time: '14:00', latency: 39.2, packetLoss: 0.95, jitter: 4.9, throughput: 16.8 },
  { time: '15:00', latency: 48.7, packetLoss: 2.10, jitter: 7.8, throughput: 18.9 },
  { time: '16:00', latency: 54.3, packetLoss: 2.80, jitter: 9.5, throughput: 19.4 },
  { time: '17:00', latency: 49.0, packetLoss: 1.95, jitter: 7.2, throughput: 18.7 }
];

export const SEED_CUSTOMERS = INITIAL_CUSTOMERS;
export const SEED_NETWORK_CELLS = INITIAL_CELLS;
export const HOURLY_TRAFFIC_FORECAST = TRAFFIC_FORECAST_DATA;

/**
 * Generates downloadable Synthetic CSV for Churn and Network KPIs
 * Labeled explicitly as synthetic data according to section 10
 */
export function generateSyntheticChurnCSV(): string {
  const headers = 'customer_id,name,wilaya,monthly_spend_dzd,data_usage_gb,calls,complaints,recharges_per_month,subscription,tenure_months,churn_probability,risk_level';
  const rows = INITIAL_CUSTOMERS.map(c => 
    `${c.id},"${c.name}",${c.wilaya},${c.monthlySpendDZD},${c.dataUsageGB},${c.callsCount},${c.complaints},${c.rechargeFrequency},${c.subscription},${c.tenureMonths},${c.churnProbability}%,${c.riskLevel}`
  );
  return [headers, ...rows].join('\n');
}

export function generateSyntheticNetworkKPIsCSV(): string {
  const headers = 'cell_id,site_name,wilaya,technology,users,latency_ms,packet_loss_pct,traffic_mbps,availability_pct,status,anomaly_confidence';
  const rows = INITIAL_CELLS.map(c => 
    `${c.cellId},"${c.siteName}",${c.wilaya},${c.technology},${c.users},${c.latencyMs},${c.packetLossPct},${c.trafficMbps},${c.availabilityPct}%,${c.status},${c.anomalyConfidence}%`
  );
  return [headers, ...rows].join('\n');
}

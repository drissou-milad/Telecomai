import React from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Radio, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Zap, 
  ShieldAlert, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Server,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend,
  Cell
} from 'recharts';
import { 
  DashboardSummary, 
  WilayaHealth, 
  Customer, 
  NetworkCell, 
  TrafficForecastPoint 
} from '../types';

interface DashboardPageProps {
  summary: DashboardSummary;
  wilayas: WilayaHealth[];
  customers: Customer[];
  cells: NetworkCell[];
  trafficForecast: TrafficForecastPoint[];
  onNavigate: (page: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectCell: (cellId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  wilayas,
  customers,
  cells,
  trafficForecast,
  onNavigate,
  onSelectCustomer,
  onSelectCell
}) => {
  const highRiskCustomers = customers.filter(c => c.riskLevel === 'HIGH');
  const anomalyCells = cells.filter(c => c.status === 'anomaly');

  // Top cells for the monitor (including normal, warning, and anomaly)
  const displayCells = cells.slice(0, 5);

  return (
    <div className="space-y-4 pb-12">
      {/* Bento Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Network Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">AI-Powered Telecom & Customer Intelligence Platform</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded font-mono-num">
            Algeria Region: North
          </span>
          <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20 font-medium">
            Live Monitoring
          </span>
          <button
            onClick={() => onNavigate('predictions')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer ml-1"
            id="dash-run-inference-btn"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Open AI Lab</span>
          </button>
        </div>
      </header>

      {/* Bento KPI Grid: 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Network Health */}
        <div 
          id="kpi-network-health"
          onClick={() => onNavigate('network')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Health</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono-num">{summary.networkHealth}%</span>
            <span className="text-[10px] text-emerald-500 font-medium">+0.2%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full" 
              style={{ width: `${summary.networkHealth}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Active Users */}
        <div 
          id="kpi-active-users"
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Users</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono-num">
              {(summary.activeUsers / 1000).toFixed(1)}K
            </span>
            <span className="text-[10px] text-slate-500">Real-time</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono-num">
            <span>4G: 68%</span>
            <span>5G: 24%</span>
            <span>3G: 8%</span>
          </div>
        </div>

        {/* KPI 3: High Risk Churn */}
        <div 
          id="kpi-high-risk-customers"
          onClick={() => onNavigate('customers')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between outline outline-1 outline-rose-500/30 hover:outline-rose-500/60 transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">High Risk Churn</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-500 font-mono-num">
              {summary.highRiskCustomers.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-400 font-medium">Alert</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-rose-400/80 font-mono-num">
            <span>At risk: {(summary.revenueAtRiskDZD / 1_000_000).toFixed(2)}M DZD</span>
            <span className="text-sky-400 underline">Inspect</span>
          </div>
        </div>

        {/* KPI 4: Anomalies */}
        <div 
          id="kpi-network-anomalies"
          onClick={() => onNavigate('network')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between outline outline-1 outline-amber-500/30 hover:outline-amber-500/60 transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Anomalies</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-500 font-mono-num">{summary.networkAnomalies}</span>
            <span className="text-[10px] text-amber-400 font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-400/80 font-mono-num">
            <span>
              {summary.totalCellsMonitored > 0
                ? `${((summary.networkAnomalies / summary.totalCellsMonitored) * 100).toFixed(1)}% of ${summary.totalCellsMonitored.toLocaleString()} cells`
                : '—'}
            </span>
            <span className="text-sky-400 underline">NOC View</span>
          </div>
        </div>
      </div>

      {/* Bento Row 1: Cell Performance Monitor (Span 8) & Intelligence (Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col Span 8: Cell Performance Monitor */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Cell Performance Monitor</h3>
            <span className="text-[10px] text-slate-500 uppercase">Showing {displayCells.length} of {summary.totalCellsMonitored.toLocaleString()} Cells</span>
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-2 font-medium">CELL ID</th>
                    <th className="pb-2 font-medium text-center">LATENCY</th>
                    <th className="pb-2 font-medium text-center">PKT LOSS</th>
                    <th className="pb-2 font-medium text-center">USERS</th>
                    <th className="pb-2 font-medium text-right">AI STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {displayCells.map((cell) => {
                    const isAnomaly = cell.status === 'anomaly';
                    const isWarning = cell.status === 'warning';
                    return (
                      <tr 
                        key={cell.cellId} 
                        onClick={() => {
                          onSelectCell(cell.cellId);
                          onNavigate('network');
                        }}
                        className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isAnomaly ? 'bg-rose-500/5' : isWarning ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className={`py-3 font-mono font-bold ${
                          isAnomaly ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-sky-400'
                        }`}>
                          {cell.cellId}
                        </td>
                        <td className={`py-3 text-center font-mono-num ${isAnomaly ? 'text-rose-500 font-bold' : ''}`}>
                          {cell.latencyMs}ms
                        </td>
                        <td className={`py-3 text-center font-mono-num ${
                          isAnomaly ? 'text-rose-500 font-bold' : isWarning ? 'text-amber-500' : 'text-emerald-400'
                        }`}>
                          {cell.packetLossPct}%
                        </td>
                        <td className="py-3 text-center font-mono-num text-slate-300">
                          {(cell.users ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          {isAnomaly ? (
                            <span className="text-rose-500 font-bold">▲ ANOMALY</span>
                          ) : isWarning ? (
                            <span className="text-amber-500 font-bold">◆ WARNING</span>
                          ) : (
                            <span className="text-emerald-500 font-medium">● NORMAL</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* AI Incident Summary: CELL-TLM-034 */}
            <div className="p-4 bg-slate-950 rounded-lg border border-rose-500/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-tighter flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  AI Incident Summary: CELL-TLM-034 (Tlemcen)
                </h4>
                <button
                  onClick={() => {
                    onSelectCell('CELL-TLM-034');
                    onNavigate('network');
                  }}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
                >
                  Mitigate in NOC
                </button>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Cell TLM-034 is experiencing significant network degradation. Primary indicators: +182% latency spikes (112ms) and +340% packet loss (5.2%). Possible causes: unusual localized traffic surge or infrastructure PRB congestion. Recommended: Immediate automated PRB load-balancing beam deflection.
              </p>
            </div>
          </div>
        </div>

        {/* Col Span 4: Customer Intelligence & ML Performance Bento Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Bento Card: Customer Intelligence */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Customer Intelligence</h3>
              <div className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded font-bold">PRIORITY CASE</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-rose-500 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-white font-mono-num">78%</span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-mono-num">ID: C10245</div>
                  <div className="text-sm font-bold text-white">High Churn Risk</div>
                  <div className="text-xs text-slate-400">Karim Bouzid (Algiers)</div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Complaints</span>
                    <span className="text-rose-400 font-mono-num">3 Active</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Usage Trend</span>
                    <span className="text-rose-400 font-mono-num">-27% (30d)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Tenure</span>
                    <span className="text-sky-400 font-mono-num">8 Months</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-sky-500/10 border border-sky-500/20 rounded text-[11px] text-sky-100 flex flex-col gap-2">
              <div>
                <span className="font-bold block mb-0.5 uppercase text-sky-400 text-[10px] tracking-wider">AI Recommendation</span>
                <span>Offer personalized 15GB 5G data loyalty package or direct support VIP call.</span>
              </div>
              <button
                onClick={() => {
                  onSelectCustomer('C10245');
                  onNavigate('customers');
                }}
                className="w-full py-1 text-center font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors cursor-pointer"
              >
                Inspect Customer 360
              </button>
            </div>
          </div>

          {/* Bento Card: ML Performance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">ML Performance</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono-num border border-sky-500/20">
                Champion
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">ROC-AUC</div>
                <div className="text-lg font-mono font-bold text-sky-400">0.87</div>
              </div>
              <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">F1-Score</div>
                <div className="text-lg font-mono font-bold text-sky-400">0.80</div>
              </div>
              <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Recall</div>
                <div className="text-lg font-mono font-bold text-sky-400">0.79</div>
              </div>
              <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Precision</div>
                <div className="text-lg font-mono font-bold text-sky-400">0.81</div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 flex justify-between items-center px-1">
              <span>Model: Random Forest / XGBoost</span>
              <button 
                onClick={() => onNavigate('predictions')}
                className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
              >
                Model Lab
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Row 2: 24h Traffic Forecasting (Span 8) & Wilaya Regional Health (Span 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Span 8: 24h Traffic Forecasting */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Traffic Forecasting & Capacity Planning
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono-num border border-slate-700">
                  ML SARIMA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hourly throughput in Gbps: Actual Today vs AI Predicted Tomorrow.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono-num">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-3 h-1.5 rounded-full bg-sky-400" /> Today Actual
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-1.5 rounded-full bg-amber-400 border border-dashed border-amber-300" /> Tomorrow (AI)
              </span>
            </div>
          </div>

          {/* Traffic Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bentoColorToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="bentoColorTomorrow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" Gbps" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="todayActual" 
                  name="Today Actual" 
                  stroke="#38bdf8" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#bentoColorToday)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="predictedTomorrow" 
                  name="Predicted Tomorrow" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  fillOpacity={1} 
                  fill="url(#bentoColorTomorrow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs text-center font-mono-num">
            <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Peak Forecast</span>
              <span className="text-white font-bold text-sm">20:00 • 1,080 Gbps</span>
            </div>
            <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Capacity Margin</span>
              <span className="text-emerald-400 font-bold text-sm">+22.4% Headroom</span>
            </div>
            <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Congestion Risk</span>
              <span className="text-amber-400 font-bold text-sm">Bab Ezzouar</span>
            </div>
          </div>
        </div>

        {/* Right Span 4: Wilaya Regional Health Matrix */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Network Health by Wilaya
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Synthetic regional traffic simulation — illustrative, not real operator statistics
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono-num">
                8 Wilayas
              </span>
            </div>

            {/* List of 8 Wilayas */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {wilayas.map((w) => {
                const isWarning = w.healthPct < 94.0;
                return (
                  <div
                    key={w.wilaya}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{w.wilaya}</span>
                        <span className="text-[10px] text-slate-500 font-mono-num">
                          {w.activeCells} cells • {w.anomalies} alerts
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold font-mono-num ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {w.healthPct}%
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono-num">
                        {w.avgLatencyMs}ms
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
            <span>Overall SLA: <strong className="text-white">99.2%</strong></span>
            <button
              onClick={() => onNavigate('network')}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect NOC</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Radio, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Sliders, 
  Sparkles, 
  Zap, 
  Send, 
  ShieldAlert, 
  RefreshCw,
  Search,
  Layers,
  Wrench
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar,
  Legend 
} from 'recharts';
import { NetworkCell, CellStatus } from '../types';
import { NOC_TELEMETRY_SERIES } from '../data/telecomData';
import { predictNetworkAnomalyApi } from '../ml/mlEngine';

interface NetworkPageProps {
  cells: NetworkCell[];
  selectedCellId: string;
  onSelectCell: (id: string) => void;
  onUpdateCell: (updated: NetworkCell) => void;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({
  cells,
  selectedCellId,
  onSelectCell,
  onUpdateCell
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterWilaya, setFilterWilaya] = useState<string>('ALL');
  const [searchCell, setSearchCell] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active selected cell (default to CELL-TLM-034 or CELL-003 if available)
  const currentCell = cells.find(c => c.cellId === selectedCellId) || 
                      cells.find(c => c.cellId === 'CELL-TLM-034') || 
                      cells[0];

  // Filtered cells list
  const filteredCells = cells.filter(cell => {
    const matchesSearch = 
      cell.cellId.toLowerCase().includes(searchCell.toLowerCase()) ||
      cell.siteName.toLowerCase().includes(searchCell.toLowerCase()) ||
      cell.wilaya.toLowerCase().includes(searchCell.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || cell.status === filterStatus;
    const matchesWilaya = filterWilaya === 'ALL' || cell.wilaya === filterWilaya;

    return matchesSearch && matchesStatus && matchesWilaya;
  });

  // Action: Automated PRB Beam Reroute / Mitigation
  const handleTriggerMitigation = async () => {
    if (!currentCell) return;
    setActionError(null);

    // Simulate load-balancing reroute
    const updatedMetrics = {
      cellId: currentCell.cellId,
      users: Math.round(currentCell.users * 0.65), // offload 35% users
      latencyMs: Math.max(31, Math.round(currentCell.latencyMs * 0.45)), // latency drops
      packetLossPct: 0.5,
      trafficMbps: Math.round(currentCell.trafficMbps * 0.7),
      availabilityPct: 99.7
    };

    try {
      const newAnomalyResult = await predictNetworkAnomalyApi(updatedMetrics);

      const updatedCell: NetworkCell = {
        ...currentCell,
        users: updatedMetrics.users,
        latencyMs: updatedMetrics.latencyMs,
        packetLossPct: updatedMetrics.packetLossPct,
        trafficMbps: updatedMetrics.trafficMbps,
        availabilityPct: updatedMetrics.availabilityPct,
        status: newAnomalyResult.status,
        anomalyScore: newAnomalyResult.anomalyScore,
        anomalyConfidence: newAnomalyResult.confidencePct,
        possibleCauses: ['Load rerouted to neighboring sectors', 'Nominal PRB utilization restored'],
        aiIncidentSummary: `Incident mitigated for ${currentCell.cellId}. Traffic successfully offloaded via dynamic beamforming. SLA restored.`,
        lastAlarmTime: 'Just now (Resolved)'
      };

      onUpdateCell(updatedCell);
      setActionSuccessMsg(`Traffic load-balancing dispatched for ${currentCell.cellId}. Latency and packet drop stabilized!`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reach the anomaly prediction API.');
    }
  };

  const handleSimulateSurge = async () => {
    if (!currentCell) return;
    setActionError(null);

    // Induce congestion
    const surgeMetrics = {
      cellId: currentCell.cellId,
      users: 1980,
      latencyMs: 104,
      packetLossPct: 4.9,
      trafficMbps: 990,
      availabilityPct: 95.8
    };

    try {
      const result = await predictNetworkAnomalyApi(surgeMetrics);

      const degradedCell: NetworkCell = {
        ...currentCell,
        ...surgeMetrics,
        status: result.status,
        anomalyScore: result.anomalyScore,
        anomalyConfidence: result.confidencePct,
        possibleCauses: result.possibleCauses,
        aiIncidentSummary: result.aiIncidentSummary,
        lastAlarmTime: 'Just now (Critical Anomaly)'
      };

      onUpdateCell(degradedCell);
      setActionSuccessMsg(`Simulated network stress applied to ${currentCell.cellId}. Isolation Forest flagged critical anomaly!`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reach the anomaly prediction API.');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Bento Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Network Monitor (NOC)
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Radio Access Network (RAN) Telemetry & Isolation Forest Anomaly Detection
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono-num px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
            3GPP Rel 16 / 5G NR
          </span>
          <span className="text-xs font-mono-num px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Isolation Forest Contamination: 3.7%
          </span>
        </div>
      </header>

      {/* NOC KPI Metrics Bento 5-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 font-mono-num">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Health Index</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">94.7%</span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">Nominal</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">RTT Latency</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-sky-400">32ms</span>
            <span className="text-[10px] text-slate-500">core avg</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Packet Loss</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">0.8%</span>
            <span className="text-[10px] text-amber-500">&lt; 1.5% target</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Radio Avail.</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">99.2%</span>
            <span className="text-[10px] text-emerald-400">99.0% SLA</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Link Jitter</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-200">4.2ms</span>
            <span className="text-[10px] text-slate-500">DMM RT</span>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 px-4 text-xs text-sky-300 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {actionError && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 px-4 text-xs text-amber-300 font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-amber-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Grid: Selected Cell AI Alert & Incident Summary vs Cells Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Selected Cell Diagnostic Bento Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            {/* Top border colored by status */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              currentCell.status === 'anomaly' ? 'bg-rose-500' :
              currentCell.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />

            <div className="border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    currentCell.status === 'anomaly' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    currentCell.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                      Cell Telemetry Diagnostic
                    </span>
                    <h2 className="text-xl font-bold text-white font-mono-num mt-0.5">
                      {currentCell.cellId}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold font-mono-num ${
                    currentCell.status === 'anomaly' ? 'bg-rose-500/20 text-rose-500' :
                    currentCell.status === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {currentCell.status === 'anomaly' ? 'ANOMALY DETECTED' :
                     currentCell.status === 'warning' ? 'WARNING' : 'NOMINAL'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono-num mt-2">
                <span>{currentCell.siteName} • {currentCell.wilaya}</span>
                <span className="text-sky-400 font-bold">{currentCell.technology}</span>
              </div>
            </div>

            {/* AI Confidence & Isolation Forest score */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4">
              <div className="flex items-center justify-between text-xs font-mono-num mb-1.5">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Model Confidence</span>
                <span className={`font-bold text-sm ${
                  currentCell.status === 'anomaly' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {currentCell.anomalyConfidence}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    currentCell.status === 'anomaly' ? 'bg-rose-500' :
                    currentCell.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${currentCell.anomalyConfidence}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-num mt-2">
                <span>Score: <strong className="text-slate-300">{currentCell.anomalyScore}</strong></span>
                <span>Alarm: <strong className="text-slate-300">{currentCell.lastAlarmTime}</strong></span>
              </div>
            </div>

            {/* Live Cell Telemetry Data Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono-num mb-4">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Users</span>
                <span className="text-white font-bold text-sm">{(currentCell?.users ?? 0).toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Latency</span>
                <span className={`font-bold text-sm ${currentCell.latencyMs > 60 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {currentCell.latencyMs}ms
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Packet Loss</span>
                <span className={`font-bold text-sm ${currentCell.packetLossPct > 2.0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {currentCell.packetLossPct}%
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Throughput</span>
                <span className="text-slate-200 font-bold text-sm">{currentCell.trafficMbps} Mbps</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Availability</span>
                <span className={`font-bold text-sm ${currentCell.availabilityPct < 98 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {currentCell.availabilityPct}%
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Jitter</span>
                <span className="text-slate-200 font-bold text-sm">{currentCell.jitterMs}ms</span>
              </div>
            </div>

            {/* AI Incident Summary (Section 18 Standout Feature) */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Incident Summary & Root Causes</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                <p>{currentCell.aiIncidentSummary}</p>
                {currentCell.possibleCauses.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono-num space-y-1">
                    <span className="text-slate-400 font-semibold block">Primary Root Causes Identified:</span>
                    {currentCell.possibleCauses.map((cause, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-rose-400/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* NOC Mitigation Controls */}
            <div className="border-t border-slate-800 pt-3 mt-3 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                NOC Mitigation Controls
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTriggerMitigation}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Reroute PRB Load</span>
                </button>
                <button
                  onClick={handleSimulateSurge}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Simulate Surge</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Network Cells Table matching Section 8 */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Cell ID (e.g. A003, CELL-001, TLM-034)..."
                value={searchCell}
                onChange={(e) => setSearchCell(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono-num"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['ALL', 'anomaly', 'warning', 'normal'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer capitalize ${
                    filterStatus === status
                      ? status === 'anomaly' ? 'bg-rose-500 text-white'
                        : status === 'warning' ? 'bg-amber-500 text-slate-950'
                        : status === 'normal' ? 'bg-emerald-500 text-slate-950'
                        : 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Wilaya Filter */}
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Wilayas</option>
              <option value="Algiers">Algiers</option>
              <option value="Oran">Oran</option>
              <option value="Constantine">Constantine</option>
              <option value="Tlemcen">Tlemcen</option>
              <option value="Sétif">Sétif</option>
            </select>
          </div>

          {/* Network Cells Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 font-mono-num">
                RAN CELL TELEMETRY ({filteredCells.length} Monitored)
              </h3>
              <span className="text-[10px] text-slate-500 uppercase font-mono-num">
                Real-time 3GPP telemetry
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px] font-mono-num border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Cell ID</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Users</th>
                    <th className="py-2.5 px-3 font-semibold">Latency</th>
                    <th className="py-2.5 px-3 font-semibold">Loss</th>
                    <th className="py-2.5 px-3 font-semibold">Traffic</th>
                    <th className="py-2.5 px-3 font-semibold">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono-num text-slate-300">
                  {filteredCells.map((cell) => {
                    const isSelected = cell.cellId === currentCell.cellId;
                    return (
                      <tr
                        key={cell.cellId}
                        onClick={() => onSelectCell(cell.cellId)}
                        className={`transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-sky-500/10 border-l-2 border-sky-400' 
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold font-mono text-white block">{cell.cellId}</span>
                          <span className="text-[10px] text-slate-400 font-sans">{cell.siteName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            cell.status === 'anomaly' ? 'bg-rose-500/20 text-rose-500' :
                            cell.status === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {cell.status === 'anomaly' ? 'Anomaly' :
                             cell.status === 'warning' ? 'Warning' : 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {(cell.users ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`${cell.latencyMs > 60 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                            {cell.latencyMs}ms
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`${cell.packetLossPct > 2.0 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                            {cell.packetLossPct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {cell.trafficMbps} Mbps
                        </td>
                        <td className="py-3 px-3">
                          <span className={`${cell.availabilityPct < 98 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {cell.availabilityPct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Telemetry Chart: Latency & Packet Loss Trendline in Bento Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                Network Telemetry Trends (Last 10 Hours)
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono-num">
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-2.5 h-1 bg-sky-400 rounded-full" /> Latency (ms)
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-1 bg-rose-400 rounded-full" /> Packet Loss (%)
                </span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={NOC_TELEMETRY_SERIES} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                  />
                  <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="packetLoss" name="Packet Loss (%)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

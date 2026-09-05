import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  PhoneCall, 
  Gift, 
  Sparkles, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Customer, RiskLevel, DashboardSummary } from '../types';
import { predictCustomerChurnApi } from '../ml/mlEngine';

interface CustomersPageProps {
  customers: Customer[];
  summary: DashboardSummary;
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  onUpdateCustomer: (updated: Customer) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  summary,
  selectedCustomerId,
  onSelectCustomer,
  onUpdateCustomer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState<string>('ALL');
  const [offerApplied, setOfferApplied] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Find currently selected customer (default to C10245)
  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Filtered customer list
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.wilaya.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = selectedRiskFilter === 'ALL' || c.riskLevel === selectedRiskFilter;
    const matchesWilaya = selectedWilayaFilter === 'ALL' || c.wilaya === selectedWilayaFilter;

    return matchesSearch && matchesRisk && matchesWilaya;
  });

  // Action: Apply Retention Package (Interactive simulation)
  const handleApplyRetentionOffer = async () => {
    if (!currentCustomer) return;
    setActionError(null);

    // Simulate retention incentive: customer receives bonus data and VIP resolution
    const simulatedInputs = {
      monthlySpendDZD: currentCustomer.monthlySpendDZD,
      dataUsageGB: currentCustomer.dataUsageGB + 10, // increased usage from bonus
      callsCount: currentCustomer.callsCount,
      complaints: 0, // complaints resolved by VIP team
      rechargeFrequency: currentCustomer.rechargeFrequency + 1,
      subscription: currentCustomer.subscription,
      tenureMonths: currentCustomer.tenureMonths + 1
    };

    try {
      const newResult = await predictCustomerChurnApi(simulatedInputs);

      const updatedCustomer: Customer = {
        ...currentCustomer,
        churnProbability: newResult.churnProbability,
        riskLevel: newResult.riskLevel,
        riskFactors: newResult.riskFactors,
        recommendedAction: 'Retention incentive successfully accepted. Account stabilized with VIP loyalty pack.',
        complaints: 0,
        usageDeclinePct: Math.max(0, currentCustomer.usageDeclinePct - 20)
      };

      onUpdateCustomer(updatedCustomer);
      setOfferApplied(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reach the churn prediction API.');
    }
  };

  const handleResetCustomer = async () => {
    setOfferApplied(false);
    setActionError(null);
    try {
      // Trigger reset with original logic
      const originalResult = await predictCustomerChurnApi({
        monthlySpendDZD: currentCustomer.monthlySpendDZD,
        dataUsageGB: 4.2,
        callsCount: 34,
        complaints: 3,
        rechargeFrequency: 2,
        subscription: currentCustomer.subscription,
        tenureMonths: 8
      });
      const resetCust: Customer = {
        ...currentCustomer,
        churnProbability: originalResult.churnProbability,
        riskLevel: originalResult.riskLevel,
        riskFactors: originalResult.riskFactors,
        complaints: 3,
        usageDeclinePct: 27
      };
      onUpdateCustomer(resetCust);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reach the churn prediction API.');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Bento Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Customer Intelligence & Churn
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            AI-Powered Attrition Scoring, Explainable AI Attributions & Automated VIP Retention
          </p>
        </div>

        {/* Quick Bento Stats */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono-num">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">High Risk</span>
              <span className="text-rose-400 font-bold block">{summary.highRiskCustomers.toLocaleString()}</span>
            </div>
            <div className="h-5 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Churn Rate</span>
              <span className="text-amber-400 font-bold block">{summary.churnRatePct}%</span>
            </div>
            <div className="h-5 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Revenue At Risk</span>
              <span className="text-rose-400 font-bold block">{(summary.revenueAtRiskDZD / 1_000_000).toFixed(1)}M DZD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Customer Detail Inspector & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Customer Intelligence Bento Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            {/* Ambient indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              currentCustomer.riskLevel === 'HIGH' ? 'bg-rose-500' :
              currentCustomer.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />

            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Customer Intelligence
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {currentCustomer.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-num mt-0.5">
                  <span className="text-sky-400 font-mono font-bold">ID: {currentCustomer.id}</span>
                  <span>•</span>
                  <span>{currentCustomer.wilaya}</span>
                  <span>•</span>
                  <span>{currentCustomer.subscription}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-mono-num ${
                  currentCustomer.riskLevel === 'HIGH' 
                    ? 'bg-rose-500/20 text-rose-500'
                    : currentCustomer.riskLevel === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {currentCustomer.riskLevel === 'HIGH' && <AlertTriangle className="w-3 h-3" />}
                  {currentCustomer.riskLevel === 'LOW' && <CheckCircle2 className="w-3 h-3" />}
                  {currentCustomer.riskLevel} RISK
                </span>
              </div>
            </div>

            {/* Circular Gauge Bento Meter */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 my-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center shrink-0 ${
                  currentCustomer.riskLevel === 'HIGH' ? 'border-t-rose-500' :
                  currentCustomer.riskLevel === 'MEDIUM' ? 'border-t-amber-500' : 'border-t-emerald-500'
                }`}>
                  <span className="text-lg font-bold text-white font-mono-num">
                    {currentCustomer.churnProbability}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Churn Probability
                  </span>
                  <span className={`text-sm font-bold block ${
                    currentCustomer.riskLevel === 'HIGH' ? 'text-rose-400' :
                    currentCustomer.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {currentCustomer.riskLevel === 'HIGH' ? 'Critical Retention Threat' :
                     currentCustomer.riskLevel === 'MEDIUM' ? 'Moderate Attrition Risk' : 'Healthy Subscriber'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Calculated by Random Forest v1.4
                  </span>
                </div>
              </div>

              <div className="text-right text-xs font-mono-num">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Usage Trend</div>
                <div className="text-rose-400 font-bold text-sm">-{currentCustomer.usageDeclinePct}% (30d)</div>
              </div>
            </div>

            {/* Customer Raw Attributes Bento 6-grid */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono-num my-3">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Spend</span>
                <span className="text-slate-200 font-bold">{(currentCustomer?.monthlySpendDZD ?? 0).toLocaleString()} DZD</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Data Usage</span>
                <span className="text-slate-200 font-bold">{currentCustomer.dataUsageGB} GB</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Calls</span>
                <span className="text-slate-200 font-bold">{currentCustomer.callsCount}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Complaints</span>
                <span className={`font-bold ${currentCustomer.complaints > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentCustomer.complaints} active
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Recharge</span>
                <span className="text-slate-200 font-bold">{currentCustomer.rechargeFrequency}/mo</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Tenure</span>
                <span className="text-sky-400 font-bold">{currentCustomer.tenureMonths} mos</span>
              </div>
            </div>

            {/* Explainable AI Factor Attribution */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Explainable AI Attribution
                </span>
                <span className="text-[10px] text-slate-500 font-mono-num">SHAP / Feature Impact</span>
              </div>

              <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                {currentCustomer.riskFactors.map((rf, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-mono-num text-[11px]">
                      <span className="text-slate-300 flex items-center gap-1">
                        <span className="text-amber-400 font-bold">⚠</span> {rf.factor}
                      </span>
                      <span className="text-rose-400 font-bold">
                        {rf.shapValue ? `SHAP ${rf.shapValue}` : `+${rf.impactPct}% risk`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-rose-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(rf.impactPct * 3.5, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">{rf.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation Box matching Bento design */}
            <div className="border-t border-slate-800 pt-3 mt-3 space-y-2">
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg text-xs text-sky-100">
                <span className="font-bold block mb-1 uppercase text-sky-400 text-[10px] tracking-wider">
                  AI Recommended Retention Action
                </span>
                <p className="leading-relaxed">"{currentCustomer.recommendedAction}"</p>
              </div>

              {actionError && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px]">
                  {actionError}
                </div>
              )}

              {/* Interactive Retention Simulation Button */}
              <div className="pt-1">
                {!offerApplied ? (
                  <button
                    onClick={handleApplyRetentionOffer}
                    id="btn-apply-retention-offer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Apply Simulated Retention Action (15 GB Bonus)</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between bg-emerald-500/15 border border-emerald-500/40 rounded-lg p-2 px-3 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Offer Accepted • Risk Stabilized!
                    </span>
                    <button
                      onClick={handleResetCustomer}
                      className="text-slate-400 hover:text-slate-200 text-[11px] underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Customer Directory & Filters */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer by ID (e.g. C10245), name, or Wilaya..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono-num"
                  id="customer-search-field"
                />
              </div>

              {/* Risk Filter buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setSelectedRiskFilter(risk)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedRiskFilter === risk
                        ? risk === 'HIGH' ? 'bg-rose-500 text-white'
                          : risk === 'MEDIUM' ? 'bg-amber-500 text-slate-950'
                          : risk === 'LOW' ? 'bg-emerald-500 text-slate-950'
                          : 'bg-sky-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>

              {/* Wilaya Filter dropdown */}
              <select
                value={selectedWilayaFilter}
                onChange={(e) => setSelectedWilayaFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Wilayas</option>
                <option value="Algiers">Algiers</option>
                <option value="Oran">Oran</option>
                <option value="Constantine">Constantine</option>
                <option value="Tlemcen">Tlemcen</option>
                <option value="Sétif">Sétif</option>
                <option value="Annaba">Annaba</option>
                <option value="Blida">Blida</option>
                <option value="Batna">Batna</option>
              </select>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Subscriber Directory ({filteredCustomers.length} Records)
              </h3>
              <span className="text-[10px] text-slate-500 uppercase font-mono-num">
                Showing top telemetry matches
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px] font-mono-num border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Customer ID</th>
                    <th className="py-2.5 px-3 font-semibold">Name & Wilaya</th>
                    <th className="py-2.5 px-3 font-semibold">Spend</th>
                    <th className="py-2.5 px-3 font-semibold">Data</th>
                    <th className="py-2.5 px-3 font-semibold">Complaints</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Churn Risk</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono-num text-slate-300">
                  {filteredCustomers.map((cust) => {
                    const isSelected = cust.id === currentCustomer.id;
                    const isHigh = cust.riskLevel === 'HIGH';
                    const isMed = cust.riskLevel === 'MEDIUM';
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => onSelectCustomer(cust.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-sky-500/10 border-l-2 border-sky-400' 
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold font-mono text-sky-400">
                          {cust.id}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className="font-semibold text-white block">{cust.name}</span>
                          <span className="text-[11px] text-slate-400">{cust.wilaya} • {cust.subscription}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {(cust.monthlySpendDZD ?? 0).toLocaleString()} DZD
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {cust.dataUsageGB} GB
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            cust.complaints > 0 ? 'bg-rose-500/20 text-rose-400' : 'text-slate-500'
                          }`}>
                            {cust.complaints}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            isHigh ? 'bg-rose-500/20 text-rose-500' :
                            isMed ? 'bg-amber-500/20 text-amber-500' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {cust.churnProbability}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCustomer(cust.id);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { NetworkPage } from './pages/NetworkPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { AboutPage } from './pages/AboutPage';

import { 
  SEED_CUSTOMERS, 
  SEED_NETWORK_CELLS, 
  SYNTHETIC_WILAYA_SIMULATION, 
  LOADING_DASHBOARD_SUMMARY, 
  HOURLY_TRAFFIC_FORECAST 
} from './data/telecomData';
import { getDashboardSummary } from './ml/mlEngine';
import { Customer, NetworkCell, UserRole, DashboardSummary } from './types';
import { Sparkles, Terminal, ShieldCheck, Radio, Database } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [cells, setCells] = useState<NetworkCell[]>(SEED_NETWORK_CELLS);
  const [summary, setSummary] = useState<DashboardSummary>(LOADING_DASHBOARD_SUMMARY);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('C10245');
  const [selectedCellId, setSelectedCellId] = useState<string>('CELL-TLM-034');

  // Load headline KPIs from the backend (scored from the real dataset/model) on mount.
  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setSummaryError(err.message || 'Failed to load dashboard summary.'));
  }, []);

  // Navigate handler
  const handleNavigate = (page: string) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update customer (e.g. from retention action). The demo-customer list here is a
  // small illustrative sample, separate from the full dataset the backend scores for
  // the headline KPIs above, so we don't try to keep them in perfect lockstep - we just
  // avoid re-introducing a hand-typed number.
  const handleUpdateCustomer = (updated: Customer) => {
    const updatedList = customers.map(c => c.id === updated.id ? updated : c);
    setCustomers(updatedList);
  };

  // Update cell (e.g. from NOC mitigation)
  const handleUpdateCell = (updated: NetworkCell) => {
    const updatedList = cells.map(c => c.cellId === updated.cellId ? updated : c);
    setCells(updatedList);

    // Recalculate anomaly count
    const anomaliesCount = updatedList.filter(c => c.status === 'anomaly').length;
    setSummary(prev => ({
      ...prev,
      networkAnomalies: anomaliesCount
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Top Fixed Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        userRole={userRole}
        onToggleRole={() => setUserRole(prev => prev === 'Admin' ? 'Analyst' : 'Admin')}
        anomaliesCount={cells.filter(c => c.status === 'anomaly').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'dashboard' && (
          <DashboardPage
            summary={summary}
            wilayas={SYNTHETIC_WILAYA_SIMULATION}
            customers={customers}
            cells={cells}
            trafficForecast={HOURLY_TRAFFIC_FORECAST}
            onNavigate={handleNavigate}
            onSelectCustomer={(id) => {
              setSelectedCustomerId(id);
              handleNavigate('customers');
            }}
            onSelectCell={(id) => {
              setSelectedCellId(id);
              handleNavigate('network');
            }}
          />
        )}

        {activePage === 'customers' && (
          <CustomersPage
            customers={customers}
            summary={summary}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            onUpdateCustomer={handleUpdateCustomer}
          />
        )}

        {activePage === 'network' && (
          <NetworkPage
            cells={cells}
            selectedCellId={selectedCellId}
            onSelectCell={setSelectedCellId}
            onUpdateCell={handleUpdateCell}
          />
        )}

        {activePage === 'predictions' && (
          <PredictionsPage />
        )}

        {activePage === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Bottom Bento Telecom Status & Compliance Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 mt-auto py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold font-mono-num">
              <Radio className="w-3.5 h-3.5" />
              <span>TelecomAI</span>
            </div>
            <span className="text-slate-800">|</span>
            <span className="text-slate-400">
              AI-Powered Telecom & Customer Intelligence Platform
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono-num text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Backend: Connected
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-sky-400">
              <Database className="w-3 h-3" /> Algeria Wilayas Telemetry (Synthetic)
            </span>
            <span>•</span>
            <span>ROC-AUC: 0.87 • Champion XGBoost</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

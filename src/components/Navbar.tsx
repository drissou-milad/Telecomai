import React from 'react';
import { 
  Activity, 
  Users, 
  Radio, 
  Cpu, 
  Info, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  SignalHigh,
  Bell
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentPage?: string;
  activePage?: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onToggleRole?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  anomalyCount?: number;
  anomaliesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  activePage,
  onNavigate,
  userRole,
  onRoleChange,
  onToggleRole,
  searchQuery = '',
  onSearchChange,
  anomalyCount,
  anomaliesCount
}) => {
  const current = activePage || currentPage || 'dashboard';
  const effectiveAnomalyCount = anomaliesCount !== undefined ? anomaliesCount : (anomalyCount || 0);

  const handleRoleToggle = (role: UserRole) => {
    if (onRoleChange) {
      onRoleChange(role);
    } else if (onToggleRole) {
      onToggleRole();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Live status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 group text-left cursor-pointer"
            id="nav-logo-btn"
          >
            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-black text-slate-950 text-base shadow-sm shadow-sky-500/30">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Telecom<span className="text-sky-400">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400 text-[10px] font-bold uppercase tracking-wider">
                  Bento Grid
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AI-Powered Telecom Intelligence</p>
            </div>
          </button>

          {/* Mobile role badge */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono-num">
              {userRole}
            </span>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 w-full md:w-auto justify-start md:justify-center border-t md:border-t-0 border-slate-800/80 mt-1 md:mt-0">
          <button
            id="nav-tab-dashboard"
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer ${
              current === 'dashboard'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-customers"
            onClick={() => onNavigate('customers')}
            className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer ${
              current === 'customers'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </button>

          <button
            id="nav-tab-network"
            onClick={() => onNavigate('network')}
            className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer relative ${
              current === 'network'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Network</span>
            {effectiveAnomalyCount > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                {effectiveAnomalyCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-predictions"
            onClick={() => onNavigate('predictions')}
            className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer ${
              current === 'predictions'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Predictions</span>
          </button>

          <button
            id="nav-tab-about"
            onClick={() => onNavigate('about')}
            className={`px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer ${
              current === 'about'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Architecture</span>
          </button>
        </nav>

        {/* Search, Role Selector & Live Status */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Search */}
          {onSearchChange && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search C10245 or CELL-003..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-48 lg:w-56 bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-mono-num"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              id="role-analyst-btn"
              onClick={() => handleRoleToggle('Analyst')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                userRole === 'Analyst'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Analyst: View customers, NOC network alerts & predictions"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Analyst</span>
            </button>
            <button
              id="role-admin-btn"
              onClick={() => handleRoleToggle('Admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                userRole === 'Admin'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Admin: Access model retraining, threshold settings & overrides"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Bento System Status Widget */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-slate-300 font-medium">Live NOC</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-400 text-[11px]">ML Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

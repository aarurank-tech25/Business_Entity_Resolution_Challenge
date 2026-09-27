import React from 'react';
import { RefreshCw, Activity, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import Badge from '../common/Badge';

export const Header = ({
  backendStatus = 'checking', // 'healthy', 'offline', 'checking'
  onRefresh,
  refreshing = false,
  activePageTitle = 'Overview',
}) => {
  return (
    <header className="h-16 border-b border-purple-100 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{activePageTitle}</span>
        </h1>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-slate-300">/</span>
          <span className="text-xs font-medium text-slate-500">Business Entity Resolution</span>
          <Badge variant="purple" size="xs">Amazon ML Challenge</Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend health indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-slate-50 border-slate-200">
          {backendStatus === 'healthy' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700 hidden sm:inline">Backend Online</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 sm:hidden" />
            </>
          )}
          {backendStatus === 'offline' && (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-700 hidden sm:inline">Backend Offline</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 sm:hidden" />
            </>
          )}
          {backendStatus === 'checking' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-slate-500 hidden sm:inline">Checking...</span>
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg border border-purple-100 hover:border-purple-300 bg-white hover:bg-purple-50/50 text-slate-600 hover:text-purple-700 transition-colors shadow-sm disabled:opacity-50"
          title="Refresh dashboard data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
        </button>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, Sparkles, ServerCrash } from 'lucide-react';
import Button from '../common/Button';

export const PageContainer = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
}) => {
  const { isMockMode, toggleMockMode, apiStatus, apiBaseUrl } = useApp();

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 ${className}`}>
      {/* Banner if Development Preview Mock Mode is active */}
      {isMockMode && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">Development Preview Mode Active: </span>
              <span className="text-amber-800">
                Displaying isolated sample mock data. When your FastAPI backend is running, switch to Live API mode.
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleMockMode(false)}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg shrink-0 border border-amber-300 cursor-pointer transition-colors"
          >
            Switch to Live API
          </button>
        </div>
      )}

      {/* Banner if in Live API mode but Backend is Offline */}
      {!isMockMode && apiStatus === 'offline' && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <ServerCrash className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-semibold">FastAPI Backend Unavailable: </span>
              <span className="text-rose-800">
                Unable to connect to {apiBaseUrl}. Ensure your FastAPI server is started, or preview with mock data.
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleMockMode(true)}
            className="text-xs font-semibold px-3 py-1.5 bg-rose-200/60 hover:bg-rose-200 text-rose-900 rounded-lg shrink-0 border border-rose-300 cursor-pointer transition-colors"
          >
            Switch to Demo Preview
          </button>
        </div>
      )}

      {/* Page Header (if title is provided) */}
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
          <div>
            {title && <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Page Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default PageContainer;

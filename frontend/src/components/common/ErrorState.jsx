import React from 'react';
import { AlertCircle, RefreshCw, ServerCrash, ExternalLink } from 'lucide-react';
import Button from './Button';
import { useApp } from '../../context/AppContext';

export const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'Unable to connect to the backend. Please check that the API server is running.',
  onRetry,
  compact = false,
  showDemoOption = true,
}) => {
  const { isMockMode, toggleMockMode, apiBaseUrl } = useApp();

  if (compact) {
    return (
      <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-800 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-rose-200 p-8 text-center max-w-lg mx-auto shadow-sm my-6">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <ServerCrash className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{message}</p>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mb-6 font-mono text-left break-all">
        Target API: {apiBaseUrl}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <Button variant="primary" icon={RefreshCw} onClick={onRetry} size="md">
            Retry Connection
          </Button>
        )}
        {showDemoOption && !isMockMode && (
          <Button
            variant="outline"
            onClick={() => toggleMockMode(true)}
            size="md"
            icon={ExternalLink}
          >
            Switch to Demo Preview
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

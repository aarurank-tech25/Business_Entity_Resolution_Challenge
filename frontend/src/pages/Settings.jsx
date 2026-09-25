import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import {
  Server,
  Settings as SettingsIcon,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
  Layers,
  Database,
  Code2,
} from 'lucide-react';
import { API_ENDPOINTS } from '../services/api';

export const Settings = () => {
  const {
    apiStatus,
    apiBaseUrl,
    checkApi,
    isMockMode,
    toggleMockMode,
    tableDensity,
    updateTableDensity,
    addToast,
  } = useApp();

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const result = await checkApi();
      if (result.connected) {
        setTestResult({
          success: true,
          message: `Successfully connected to FastAPI backend at ${apiBaseUrl}`,
        });
        addToast({
          type: 'success',
          title: 'Connection Healthy',
          message: 'Backend API is online and responding.',
        });
      } else {
        setTestResult({
          success: false,
          message: `Unable to connect to ${apiBaseUrl}. Ensure your FastAPI server is running.`,
        });
        addToast({
          type: 'error',
          title: 'Connection Failed',
          message: 'Unable to reach backend server.',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <PageContainer
      title="System Settings"
      subtitle="Manage backend API configuration, display preferences, and platform architecture."
    >
      <div className="space-y-6">
        {/* Section 1: API Configuration */}
        <Card
          title="FastAPI Backend Integration"
          subtitle="Configure REST API host and verify connectivity with backend services"
          icon={Server}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Backend API Base URL (<code className="font-mono text-purple-700 bg-purple-50 border border-purple-200/60 px-1 py-0.5 rounded">VITE_API_BASE_URL</code>)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={apiBaseUrl}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Configured via environment variable in <code className="font-mono">.env</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Connection Status
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        apiStatus === 'connected'
                          ? 'bg-emerald-500'
                          : apiStatus === 'checking'
                          ? 'bg-amber-500 animate-ping'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      {apiStatus === 'connected'
                        ? 'Backend Online'
                        : apiStatus === 'checking'
                        ? 'Testing Connection...'
                        : 'Backend Offline'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    loading={testingConnection}
                    onClick={handleTestConnection}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Development Mock Data Preview Switch */}
            <div className="mt-4 p-4 rounded-xl border border-amber-200/80 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">
                    Development Mock Data Mode
                  </span>
                  <Badge variant={isMockMode ? 'warning' : 'default'} size="sm">
                    {isMockMode ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                <p className="text-xs text-amber-800 mt-1 max-w-xl">
                  Enables offline UI demo preview with sample records from <code className="font-mono">src/mocks/</code> when the FastAPI backend is not yet started.
                </p>
              </div>

              <Button
                variant={isMockMode ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => toggleMockMode()}
              >
                {isMockMode ? 'Disable Mock Mode (Live API)' : 'Enable Mock Mode (Preview)'}
              </Button>
            </div>

            {/* Configured API Endpoints Reference Table */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Registered API Contract Endpoints (Configurable in <code className="font-mono">src/services/api.js</code>)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-purple-50/30 border border-purple-150 rounded">
                  <span className="text-emerald-700 font-bold">POST</span> /upload
                </div>
                <div className="p-2 bg-purple-50/30 border border-purple-150 rounded">
                  <span className="text-emerald-700 font-bold">POST</span> /run-matching
                </div>
                <div className="p-2 bg-purple-50/30 border border-purple-150 rounded">
                  <span className="text-purple-700 font-bold">GET</span> /results
                </div>
                <div className="p-2 bg-purple-50/30 border border-purple-150 rounded">
                  <span className="text-purple-700 font-bold">GET</span> /candidates
                </div>
                <div className="p-2 bg-purple-50/30 border border-purple-150 rounded">
                  <span className="text-purple-700 font-bold">GET</span> /metrics
                </div>
                <div className="p-2 bg-purple-50/30 border border-purple-150 rounded">
                  <span className="text-purple-700 font-bold">GET</span> /download/matching-results
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Display Preferences */}
        <Card
          title="Display & Table Preferences"
          subtitle="Customize layout density, theme, and feedback notifications"
          icon={Sliders}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Table Row Density
              </label>
              <div className="flex items-center gap-2">
                {['compact', 'normal', 'comfortable'].map((density) => (
                  <button
                    key={density}
                    onClick={() => updateTableDensity(density)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors cursor-pointer border ${
                      tableDensity === density
                        ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-xs'
                        : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50/50'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Controls padding in data tables.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Theme
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  Light Lavender (Active)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Refined soft lavender palette with purple/violet accents.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                User Feedback
              </label>
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Toast Notifications Enabled</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Displays operational status alerts.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 3: About & Architecture */}
        <Card
          title="About EntityResolve AI"
          subtitle="Cross-Source Business Entity Resolution System Architecture"
          icon={Info}
        >
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>EntityResolve AI</strong> is an enterprise-grade multi-source business entity resolution platform. It matches heterogeneous company records from Source 2 and Source 3 against golden Source 1 master entities using candidate blocking, phonetic & token similarity feature calculation, machine learning scoring, and optimal thresholding.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-2">Team Responsibilities:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-900 block">Member 1</span>
                  <span className="text-slate-500">Preprocessing & Candidate Blocking</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-900 block">Member 2</span>
                  <span className="text-slate-500">ML Scoring & Similarity Features</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="font-semibold text-slate-900 block">Member 3</span>
                  <span className="text-slate-500">FastAPI Backend Pipeline Services</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950">
                  <span className="font-bold text-purple-950 block">Member 4 (Current)</span>
                  <span className="text-purple-700 font-medium">React Frontend / UI-UX Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Settings;

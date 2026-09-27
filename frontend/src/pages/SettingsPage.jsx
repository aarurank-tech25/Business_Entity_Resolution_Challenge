import React, { useState } from 'react';
import {
  Settings,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Code,
  Shield,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import api, { API_BASE_URL } from '../api/api';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const SettingsPage = ({ backendStatus, onRefreshHealth }) => {
  const toast = useToast();
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    const startTime = performance.now();
    try {
      const res = await api.getHealth();
      const latency = Math.round(performance.now() - startTime);
      setTestResult({
        success: true,
        latency,
        data: res,
      });
      toast.success(`Connected in ${latency}ms`);
      onRefreshHealth();
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message,
      });
      toast.error('Failed to reach backend');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Environment Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review backend connectivity, API parameters, and the integration contract.
        </p>
      </div>

      {/* Connectivity & Environment Card */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-card space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-600" />
          Backend Connection Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Configured API Base URL</span>
            <div className="font-mono text-purple-900 font-semibold text-sm break-all">
              {API_BASE_URL}
            </div>
            <p className="text-[10px] text-slate-500">Read from VITE_API_BASE_URL</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Backend Live Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  backendStatus === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="font-bold capitalize text-slate-800">
                {backendStatus === 'healthy' ? 'Online & Healthy' : 'Offline / Unreachable'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Verified via GET /health</p>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            {testingConnection ? 'Testing Connection...' : 'Test Connection Now'}
          </button>

          {testResult && (
            <div className="text-xs">
              {testResult.success ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Health OK ({testResult.latency} ms response latency)
                </span>
              ) : (
                <span className="text-rose-700 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  {testResult.error}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Challenge Metadata Card */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          Challenge Metadata & Guidelines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Competition Name</span>
            <div className="font-semibold text-slate-800 mt-0.5">Amazon Business Entity Resolution</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Frontend Architecture</span>
            <div className="font-semibold text-slate-800 mt-0.5">React + Vite + Tailwind CSS</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Mock Data Mode</span>
            <div className="font-semibold text-emerald-700 mt-0.5">Disabled (Source of Truth: Backend)</div>
          </div>
        </div>
      </div>

      {/* Member 1 & Member 2 Integration Contract */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Member 1 & Member 2 Pipeline Contract</h3>
        </div>
        <p className="text-xs text-slate-500">
          The backend expects Member 2 to attach their ML entity matching pipeline in{' '}
          <code className="bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-mono">backend/services/matching_service.py</code>.
        </p>

        <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
          <pre>{`// Integration contract returned by Member 2's ML pipeline:
{
  "matches": [
    {
      "source1_entity_id": "S1-xxxx",
      "matched_entity_ids": ["S2-xxxx", "S3-xxxx"]
    }
  ],
  "candidates": [
    {
      "source1_entity_id": "S1-xxxx",
      "candidate_entity_ids": ["S2-xxxx", "S3-xxxx"]
    }
  ],
  "metrics": {
    "f0_5": 0.88,
    "precision": 0.92,
    "recall": 0.85,
    "total_source1": 1000,
    "matched_source1": 950,
    "singleton_source1": 50
  }
}`}</pre>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

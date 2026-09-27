import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Target,
  Zap,
  Award,
  Layers,
  Users,
  CheckCircle2,
  UserX,
  Clock,
  Info,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import api from '../api/api';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const InsightsPage = ({ metricsData, onRefresh }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState(metricsData || null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getMetrics();
      setCurrentMetrics(res);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (metricsData) {
      setCurrentMetrics(metricsData);
    }
  }, [metricsData]);

  const hasRealMetrics = currentMetrics?.status === 'success' && currentMetrics?.metrics;
  const metrics = currentMetrics?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Model Insights & Evaluation</h2>
            {hasRealMetrics ? (
              <Badge variant="emerald" size="sm">Real Metrics Evaluated</Badge>
            ) : (
              <Badge variant="amber" size="sm">Waiting for ML Execution</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real performance benchmarks for precision, recall, and precision-weighted F0.5.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors self-start sm:self-auto"
          title="Refresh metrics from backend"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
        </button>
      </div>

      {/* Main Metric Cards */}
      {hasRealMetrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">F0.5 Score</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">
              {metrics.f0_5 !== undefined ? `${(metrics.f0_5 * 100).toFixed(2)}%` : `${(metrics.f05 * 100).toFixed(2)}%`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Official challenge competition metric (β = 0.5)</p>
          </div>

          <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Precision</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-purple-900">
              {metrics.precision !== undefined ? `${(metrics.precision * 100).toFixed(2)}%` : '-'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Percentage of predicted matches that are correct</p>
          </div>

          <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Recall</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-indigo-900">
              {metrics.recall !== undefined ? `${(metrics.recall * 100).toFixed(2)}%` : '-'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Coverage of true duplicate entity pairs</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-purple-100 p-8 text-center shadow-card space-y-3">
          <Clock className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            Metrics will appear after the matching pipeline has executed successfully.
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            The frontend displays only ground-truth metrics evaluated by the model. No synthetic scores are calculated on the frontend.
          </p>
        </div>
      )}

      {/* Dataset & Cluster Statistics Breakdown */}
      {hasRealMetrics && (
        <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Cluster & Resolution Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Total S1 Entities</span>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {metrics.total_source1?.toLocaleString() ?? '-'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Matched Entities</span>
              <div className="text-lg font-bold text-emerald-700 mt-1">
                {metrics.matched_source1?.toLocaleString() ?? '-'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Singleton (No-Match)</span>
              <div className="text-lg font-bold text-amber-700 mt-1">
                {metrics.singleton_source1?.toLocaleString() ?? '-'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Candidate Pairs</span>
              <div className="text-lg font-bold text-purple-700 mt-1">
                {metrics.candidate_pairs?.toLocaleString() ?? '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Scoring Educational Card */}
      <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Why the Challenge Evaluates with F0.5</h3>
        </div>

        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            In enterprise business entity resolution, wrongly linking two separate companies (false positive) creates corrupt customer records, combined credit risk profiles, and regulatory compliance breaches.
          </p>
          <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-100 font-mono text-[11px] text-purple-900">
            F0.5 = (1 + 0.5²) × (Precision × Recall) / ((0.5² × Precision) + Recall) = (1.25 × P × R) / (0.25 × P + R)
          </div>
          <p>
            The F0.5 score places <strong>twice as much emphasis on Precision as Recall</strong> (β = 0.5), rewarding models that maintain conservative, high-confidence matching thresholds over aggressive merge heuristics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;

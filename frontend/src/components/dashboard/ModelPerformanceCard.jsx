import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Target, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export const ModelPerformanceCard = ({ metrics, loading }) => {
  const hasMetrics = metrics && typeof metrics.precision === 'number';

  const formatPercent = (val) => {
    if (typeof val !== 'number') return '—';
    return `${(val * 100).toFixed(1)}%`;
  };

  const getMetricQuality = (val) => {
    if (typeof val !== 'number') return 'default';
    if (val >= 0.9) return 'match';
    if (val >= 0.8) return 'info';
    return 'warning';
  };

  return (
    <Card
      title="Model Evaluation Metrics"
      subtitle="Evaluated on benchmark entity test set (F0.5 prioritizes Precision over Recall)"
      icon={Target}
      loading={loading}
      badge={<Badge variant="purple" size="sm">Backend ML Evaluation</Badge>}
      footer={
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>F0.5 weighting: β = 0.5 (Precision has 2x weight of Recall)</span>
          </div>
          {metrics?.modelVersion && (
            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {metrics.modelVersion}
            </span>
          )}
        </div>
      }
    >
      {!hasMetrics ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          <div className="p-2.5 bg-slate-100 text-slate-400 rounded-full w-fit mx-auto mb-2">
            <Target className="w-5 h-5" />
          </div>
          <p className="font-medium text-slate-700">Waiting for backend evaluation metrics</p>
          <p className="text-slate-400 mt-0.5">
            Execute the matching pipeline or connect backend evaluation endpoints to view scores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Precision */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Precision
              </span>
              <Badge variant={getMetricQuality(metrics.precision)} size="sm">
                {formatPercent(metrics.precision)}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">
                {metrics.precision.toFixed(3)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                True positive business matches / all predicted matches
              </p>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.precision * 100}%` }}
              />
            </div>
          </div>

          {/* Recall */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recall
              </span>
              <Badge variant={getMetricQuality(metrics.recall)} size="sm">
                {formatPercent(metrics.recall)}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">
                {metrics.recall.toFixed(3)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Identified matches / all actual true ground-truth matches
              </p>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.recall * 100}%` }}
              />
            </div>
          </div>

          {/* F0.5 Score */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                F0.5 Score
              </span>
              <Badge variant={getMetricQuality(metrics.f05)} size="sm">
                {formatPercent(metrics.f05)}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-emerald-700">
                {metrics.f05.toFixed(3)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Key competition metric prioritizing precision accuracy
              </p>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.f05 * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ModelPerformanceCard;

import React from 'react';
import { Target, Users, CheckCircle2, UserX, Layers, Zap, Clock } from 'lucide-react';
import Badge from '../common/Badge';

export const MetricsCards = ({ metrics, loading }) => {
  const hasData = metrics && typeof metrics.precision === 'number';

  const cards = [
    {
      label: 'Precision',
      value: hasData ? `${(metrics.precision * 100).toFixed(1)}%` : null,
      sub: 'Exact business matches',
      icon: Target,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Recall',
      value: hasData ? `${(metrics.recall * 100).toFixed(1)}%` : null,
      sub: 'Ground truth coverage',
      icon: Zap,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'F0.5 Score',
      value: hasData ? `${(metrics.f05 * 100).toFixed(1)}%` : null,
      sub: 'Precision weighted 2x',
      icon: Target,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Total S1 Entities',
      value: metrics?.source1Records?.toLocaleString() || null,
      sub: 'Master entity records',
      icon: Users,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
    },
    {
      label: 'Total Matches',
      value: metrics?.finalMatches?.toLocaleString() || null,
      sub: 'Clustered entity pairs',
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Singletons / No-Match',
      value: metrics?.singletons?.toLocaleString() || null,
      sub: 'Isolated master entities',
      icon: UserX,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Candidate Pairs',
      value: metrics?.candidatePairs?.toLocaleString() || null,
      sub: 'Evaluated blocking pairs',
      icon: Layers,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg ${c.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              {loading ? (
                <div className="h-6 w-16 bg-slate-100 animate-pulse rounded" />
              ) : c.value !== null ? (
                <div className="text-lg font-bold text-slate-900 tracking-tight">{c.value}</div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 py-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Waiting...</span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;

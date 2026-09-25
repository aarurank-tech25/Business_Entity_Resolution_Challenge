import React from 'react';
import { Clock } from 'lucide-react';

export const KPICard = ({
  icon: Icon,
  label,
  value,
  secondaryText,
  colorScheme = 'indigo', // 'indigo' | 'blue' | 'emerald' | 'amber' | 'slate'
  loading = false,
}) => {
  const colorMap = {
    indigo: {
      iconBg: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      border: 'border-purple-100 hover:border-purple-300 hover:shadow-card-hover',
      accent: 'text-purple-700',
    },
    blue: {
      iconBg: 'bg-purple-50/80 text-purple-600 border border-purple-200/60',
      border: 'border-purple-100 hover:border-purple-300 hover:shadow-card-hover',
      accent: 'text-purple-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      border: 'border-purple-100 hover:border-emerald-300 hover:shadow-card-hover',
      accent: 'text-emerald-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      border: 'border-purple-100 hover:border-amber-300 hover:shadow-card-hover',
      accent: 'text-amber-600',
    },
    slate: {
      iconBg: 'bg-purple-50/60 text-purple-700 border border-purple-200/60',
      border: 'border-purple-100 hover:border-purple-300 hover:shadow-card-hover',
      accent: 'text-purple-700',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;

  // Format number if numeric, else check if waiting
  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString()
      : value || null;

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-card transition-all ${scheme.border} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-purple-900/60 tracking-wide uppercase">
            {label}
          </span>
          <div className="mt-1">
            {loading ? (
              <div className="h-8 w-24 bg-purple-50 animate-pulse rounded-md" />
            ) : formattedValue !== null ? (
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formattedValue}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium py-1">
                <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Waiting for backend data</span>
              </div>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.iconBg} shrink-0 shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {secondaryText && (
        <div className="mt-3 pt-2.5 border-t border-purple-100/60 text-[11px] text-purple-900/60">
          {secondaryText}
        </div>
      )}
    </div>
  );
};

export default KPICard;

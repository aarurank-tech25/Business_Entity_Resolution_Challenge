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
      iconBg: 'bg-indigo-50 text-indigo-600',
      border: 'border-slate-200 hover:border-indigo-300',
      accent: 'text-indigo-600',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'border-slate-200 hover:border-blue-300',
      accent: 'text-blue-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'border-slate-200 hover:border-emerald-300',
      accent: 'text-emerald-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'border-slate-200 hover:border-amber-300',
      accent: 'text-amber-600',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600',
      border: 'border-slate-200 hover:border-slate-300',
      accent: 'text-slate-600',
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
          <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
            {label}
          </span>
          <div className="mt-1">
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md" />
            ) : formattedValue !== null ? (
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formattedValue}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium py-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Waiting for backend data</span>
              </div>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.iconBg} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {secondaryText && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
          {secondaryText}
        </div>
      )}
    </div>
  );
};

export default KPICard;

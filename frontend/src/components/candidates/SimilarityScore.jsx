import React from 'react';

export const SimilarityScore = ({ score, showBar = true, size = 'md' }) => {
  if (score === null || score === undefined || typeof score !== 'number') {
    return <span className="text-slate-400 font-mono text-xs">—</span>;
  }

  const percent = Math.round(score * 100);

  // Semantic color based on similarity threshold
  const getColor = (pct) => {
    if (pct >= 85) return { text: 'text-emerald-700', bg: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 70) return { text: 'text-indigo-700', bg: 'bg-indigo-500', pill: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (pct >= 50) return { text: 'text-amber-700', bg: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'text-slate-600', bg: 'bg-slate-400', pill: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  const scheme = getColor(percent);

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${scheme.pill}`}>
        {percent}%
      </span>
      {showBar && (
        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className={`h-full rounded-full ${scheme.bg}`}
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default SimilarityScore;

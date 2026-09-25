import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

export const DatasetStatus = ({ datasetStatus }) => {
  const navigate = useNavigate();
  const { canRunMatching, isMockMode } = useApp();

  const sources = [
    { key: 'source1', name: 'Source 1 (Master / Target)', data: datasetStatus?.source1 },
    { key: 'source2', name: 'Source 2 (Supplier / Secondary)', data: datasetStatus?.source2 },
    { key: 'source3', name: 'Source 3 (Public / Tertiary)', data: datasetStatus?.source3 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Pipeline Ingestion Status</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Entity resolution requires Source 1, Source 2, and Source 3 datasets before executing candidate generation.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Button
            variant={canRunMatching ? 'primary' : 'secondary'}
            size="md"
            icon={PlayCircle}
            disabled={!canRunMatching}
            onClick={() => navigate('/run-matching')}
          >
            {canRunMatching ? 'Proceed to Run Matching' : 'Upload All Datasets to Proceed'}
          </Button>
        </div>
      </div>

      {/* 3 Status Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
        {sources.map((item) => {
          const isUploaded = Boolean(item.data?.uploaded || isMockMode);
          return (
            <div
              key={item.key}
              className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                isUploaded
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {isUploaded ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-slate-800">{item.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isUploaded
                      ? item.data?.fileName || 'Loaded in memory'
                      : 'Awaiting CSV/TSV upload'}
                  </div>
                </div>
              </div>
              <Badge variant={isUploaded ? 'success' : 'default'} size="sm">
                {isUploaded ? 'Ready' : 'Pending'}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatasetStatus;

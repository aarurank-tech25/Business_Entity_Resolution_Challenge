import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle2, ArrowRight, Download, Users, FileText, Database, ShieldAlert } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { resultsService } from '../../services/resultsService';

export const MatchingStatus = ({
  datasetStatus,
  onRunMatching,
  isRunning,
  isCompleted,
  metrics,
}) => {
  const navigate = useNavigate();
  const { canRunMatching, isMockMode, addToast } = useApp();

  const handleDownload = async () => {
    try {
      await resultsService.downloadMatchingResults(isMockMode);
      addToast({
        type: 'success',
        title: 'Download Initiated',
        message: 'Downloading matching_results.tsv from backend...',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Unable to download results.',
      });
    }
  };

  return (
    <Card
      title="Pipeline Execution Control"
      subtitle="Verify input dataset readiness and trigger the multi-source entity resolution workflow"
      icon={PlayCircle}
    >
      <div className="space-y-6">
        {/* Pre-Run Ingestion Summary */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Pre-Run Ingestion Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-purple-50/25 border border-purple-150">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Source 1 Records</span>
                <Badge variant={datasetStatus?.source1?.uploaded || isMockMode ? 'success' : 'default'} size="sm">
                  {datasetStatus?.source1?.uploaded || isMockMode ? 'Ready' : 'Pending'}
                </Badge>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {datasetStatus?.source1?.rowCount
                  ? datasetStatus.source1.rowCount.toLocaleString()
                  : isMockMode
                  ? '12,500'
                  : '—'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {datasetStatus?.source1?.fileName || (isMockMode ? 'enterprise_crm_master.csv' : 'Awaiting upload')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/25 border border-purple-150">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Source 2 Records</span>
                <Badge variant={datasetStatus?.source2?.uploaded || isMockMode ? 'success' : 'default'} size="sm">
                  {datasetStatus?.source2?.uploaded || isMockMode ? 'Ready' : 'Pending'}
                </Badge>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {datasetStatus?.source2?.rowCount
                  ? datasetStatus.source2.rowCount.toLocaleString()
                  : isMockMode
                  ? '18,240'
                  : '—'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {datasetStatus?.source2?.fileName || (isMockMode ? 'supplier_vendor_db.tsv' : 'Awaiting upload')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/25 border border-purple-150">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Source 3 Records</span>
                <Badge variant={datasetStatus?.source3?.uploaded || isMockMode ? 'success' : 'default'} size="sm">
                  {datasetStatus?.source3?.uploaded || isMockMode ? 'Ready' : 'Pending'}
                </Badge>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {datasetStatus?.source3?.rowCount
                  ? datasetStatus.source3.rowCount.toLocaleString()
                  : isMockMode
                  ? '14,110'
                  : '—'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {datasetStatus?.source3?.fileName || (isMockMode ? 'public_registry_2026.csv' : 'Awaiting upload')}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Panel if finished */}
        {isCompleted && (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-900">
                  Matching completed successfully
                </h4>
                <p className="text-xs text-emerald-700">
                  Entity matches clustered across Source 2 and Source 3 for each Source 1 entity.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-200/60">
              <Button
                variant="primary"
                size="md"
                icon={Users}
                onClick={() => navigate('/candidates')}
              >
                View Candidates
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={FileText}
                onClick={() => navigate('/results')}
              >
                View Results
              </Button>
              <Button
                variant="success"
                size="md"
                icon={Download}
                onClick={handleDownload}
              >
                Download Results
              </Button>
            </div>
          </div>
        )}

        {/* Action Trigger Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {!canRunMatching ? (
              <span className="flex items-center gap-1.5 text-amber-700">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Upload all 3 datasets before executing the candidate blocking & ML pipeline.
              </span>
            ) : (
              <span>Target FastAPI endpoint: <code className="font-mono text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded">POST /run-matching</code></span>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={PlayCircle}
            loading={isRunning}
            disabled={!canRunMatching || isRunning}
            onClick={onRunMatching}
            className="w-full sm:w-auto"
          >
            {isRunning ? 'Executing Pipeline...' : isCompleted ? 'Re-run Matching Pipeline' : 'Run Matching'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MatchingStatus;

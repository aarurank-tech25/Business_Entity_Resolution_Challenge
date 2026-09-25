import React from 'react';
import {
  Upload,
  Cpu,
  Filter,
  Calculator,
  Brain,
  Sliders,
  FileCheck2,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const PIPELINE_STAGES = [
  { id: 'upload', name: 'Upload & Validation', description: 'Schema verification on S1, S2, S3', icon: Upload },
  { id: 'preprocessing', name: 'Preprocessing', description: 'Text normalization, phonetic hashing, cleaning', icon: Cpu },
  { id: 'candidate_blocking', name: 'Candidate Blocking', description: 'Blocking keys & index generation', icon: Filter },
  { id: 'feature_calc', name: 'Feature Calculation', description: 'Jaro-Winkler, Levenshtein, cosine, country', icon: Calculator },
  { id: 'ml_scoring', name: 'ML Scoring', description: 'Model inference & match probabilities', icon: Brain },
  { id: 'threshold_decision', name: 'Threshold Decision', description: 'Optimal cutoff & multi-source alignment', icon: Sliders },
  { id: 'result_generation', name: 'Result Generation', description: 'Clustered entity mappings & export TSV', icon: FileCheck2 },
];

export const PipelineProgress = ({
  currentStageIndex = 0,
  overallProgress = 0,
  pipelineStatus = 'idle', // 'idle' | 'running' | 'completed' | 'failed'
  elapsedTime = null,
  error = null,
}) => {
  // Determine status of individual stage
  const getStageStatus = (index) => {
    if (pipelineStatus === 'completed') return 'completed';
    if (pipelineStatus === 'failed') {
      if (index < currentStageIndex) return 'completed';
      if (index === currentStageIndex) return 'failed';
      return 'pending';
    }
    if (pipelineStatus === 'running') {
      if (index < currentStageIndex) return 'completed';
      if (index === currentStageIndex) return 'running';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <Card
      title="Entity Resolution Pipeline Stages"
      subtitle="Execution stages from dataset ingestion to clustered entity resolution decisions"
      actions={
        <div className="flex items-center gap-2">
          {elapsedTime !== null && (
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Elapsed: {typeof elapsedTime === 'number' ? `${elapsedTime.toFixed(1)}s` : elapsedTime}
            </span>
          )}
          <Badge
            variant={
              pipelineStatus === 'completed'
                ? 'success'
                : pipelineStatus === 'running'
                ? 'running'
                : pipelineStatus === 'failed'
                ? 'danger'
                : 'default'
            }
            size="md"
          >
            {pipelineStatus === 'completed'
              ? 'Pipeline Completed'
              : pipelineStatus === 'running'
              ? 'Processing Pipeline...'
              : pipelineStatus === 'failed'
              ? 'Pipeline Error'
              : 'Pipeline Ready'}
          </Badge>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress Bar Header */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span>Overall Progress</span>
              {pipelineStatus === 'running' && (
                <span className="text-[11px] text-purple-600 font-normal">
                  (Stage {currentStageIndex + 1} of {PIPELINE_STAGES.length}: {PIPELINE_STAGES[currentStageIndex]?.name})
                </span>
              )}
            </span>
            <span className="font-mono text-sm text-purple-700 font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full bg-purple-100/70 h-2.5 rounded-full overflow-hidden border border-purple-200/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pipelineStatus === 'failed'
                  ? 'bg-rose-500'
                  : pipelineStatus === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Pipeline Stage Visualizer (Horizontal on desktop, vertical on smaller screens) */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 pt-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const status = getStageStatus(idx);
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                    : status === 'running'
                    ? 'bg-purple-50 border-purple-300 shadow-lavender-glow ring-2 ring-purple-200 text-purple-950 animate-subtle-pulse'
                    : status === 'failed'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-purple-50/20 border-purple-150 text-slate-600 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : status === 'running'
                          ? 'bg-purple-100 text-purple-600'
                          : status === 'failed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-purple-100/60 text-purple-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : status === 'running' ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : status === 'failed' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold leading-snug">{stage.name}</h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider">
                    {status === 'completed'
                      ? '✓ Done'
                      : status === 'running'
                      ? '⟳ Running'
                      : status === 'failed'
                      ? '✕ Error'
                      : '○ Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PipelineProgress;

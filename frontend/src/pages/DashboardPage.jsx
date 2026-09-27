import React from 'react';
import {
  Database,
  PlayCircle,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  FileCheck,
  Server,
} from 'lucide-react';
import MetricsCards from '../components/results/MetricsCards';
import Badge from '../components/common/Badge';

export const DashboardPage = ({
  datasetsInfo,
  metricsData,
  resultsInfo,
  candidatesInfo,
  loading,
  onNavigate,
  onRefresh,
}) => {
  // Extract real metrics if provided by backend
  const realMetrics = metricsData?.status === 'success' && metricsData?.metrics ? metricsData.metrics : null;

  // Format metrics object for MetricsCards
  const formattedMetrics = realMetrics
    ? {
        precision: typeof realMetrics.precision === 'number' ? realMetrics.precision : null,
        recall: typeof realMetrics.recall === 'number' ? realMetrics.recall : null,
        f05: typeof realMetrics.f0_5 === 'number' ? realMetrics.f0_5 : (typeof realMetrics.f05 === 'number' ? realMetrics.f05 : null),
        source1Records: realMetrics.total_source1,
        finalMatches: realMetrics.matched_source1,
        singletons: realMetrics.singleton_source1,
        candidatePairs: candidatesInfo?.total_rows || null,
      }
    : null;

  const allDatasetsUploaded = datasetsInfo?.all_uploaded || false;
  const hasResults = resultsInfo?.exists || false;
  const hasCandidates = candidatesInfo?.exists || false;

  return (
    <div className="space-y-6">
      {/* Top Banner / System State */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-md bg-purple-500/20 text-purple-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-purple-200 tracking-wide uppercase">
              Amazon Business Entity Resolution Challenge
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Cross-Source Entity Matching & Candidate Generation
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Scalable resolution pipeline designed for Source 1, Source 2, and Source 3 business records.
            Ingest multi-hundred-MB TSVs with streaming preview, execute ML matching, and export validated candidate pairs.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-purple-800/50">
            <button
              onClick={() => onNavigate('datasets')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              Manage Datasets
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
            <button
              onClick={() => onNavigate('matching')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Run Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Resolution Evaluation Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Real model performance scores reported directly from the backend
            </p>
          </div>
          <div>
            {formattedMetrics ? (
              <Badge variant="emerald" size="sm">Real Metrics Loaded</Badge>
            ) : (
              <Badge variant="amber" size="sm">Waiting for matching pipeline</Badge>
            )}
          </div>
        </div>

        {/* Existing component reuse */}
        <MetricsCards metrics={formattedMetrics} loading={loading} />

        {!formattedMetrics && !loading && (
          <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note:</strong> Real precision, recall, and F0.5 scores will appear automatically once the ML matching pipeline executes. No mock scores are simulated.
            </span>
          </div>
        )}
      </div>

      {/* Pipeline Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Datasets Status */}
        <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                1. Dataset Ingestion
              </span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-base font-bold text-slate-900">Source TSV Datasets</h4>
            <p className="text-xs text-slate-500 mt-1">
              Source 1, Source 2, and Source 3 datasets for cross-source resolution.
            </p>

            <div className="mt-4 space-y-2">
              {['source1', 'source2', 'source3'].map((s) => {
                const info = datasetsInfo?.datasets?.[s];
                const exists = info?.exists || false;
                return (
                  <div key={s} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-mono text-slate-700 font-medium">{s}.tsv</span>
                    {exists ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {info?.file_size_mb || 0} MB
                      </span>
                    ) : (
                      <span className="text-slate-400">Not uploaded</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('datasets')}
            className="mt-4 text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
          >
            <span>Configure datasets</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Matching Execution Status */}
        <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                2. ML Pipeline
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-base font-bold text-slate-900">Entity Matching Service</h4>
            <p className="text-xs text-slate-500 mt-1">
              Pluggable contract for Member 1 & Member 2 entity resolution model.
            </p>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Datasets Ready:</span>
                <span className={`font-semibold ${allDatasetsUploaded ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {allDatasetsUploaded ? 'Yes (3/3)' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ML Pipeline Hook:</span>
                <span className="font-semibold text-purple-700">Pluggable Interface</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Validator:</span>
                <span className="font-semibold text-slate-700">utils/validate_submission.py</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('matching')}
            className="mt-4 text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
          >
            <span>Open matching console</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Challenge Outputs */}
        <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                3. Challenge Outputs
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-base font-bold text-slate-900">Required Artifacts</h4>
            <p className="text-xs text-slate-500 mt-1">
              Final challenge deliverables formatted per Amazon guidelines.
            </p>

            <div className="mt-4 space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                <div>
                  <div className="font-mono font-medium text-slate-800">matching_results.tsv</div>
                  <div className="text-[10px] text-slate-400">source1_entity_id, matched_entity_ids</div>
                </div>
                {hasResults ? (
                  <Badge variant="emerald" size="xs">{resultsInfo?.total_rows || 0} rows</Badge>
                ) : (
                  <Badge variant="default" size="xs">Pending</Badge>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                <div>
                  <div className="font-mono font-medium text-slate-800">candidate_pairs.tsv</div>
                  <div className="text-[10px] text-slate-400">source1_entity_id, candidate_entity_ids</div>
                </div>
                {hasCandidates ? (
                  <Badge variant="emerald" size="xs">{candidatesInfo?.total_rows || 0} rows</Badge>
                ) : (
                  <Badge variant="default" size="xs">Pending</Badge>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="mt-4 text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
          >
            <span>View challenge results</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

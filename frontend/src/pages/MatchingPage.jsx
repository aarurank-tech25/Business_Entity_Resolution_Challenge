import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Info,
} from 'lucide-react';
import api from '../api/api';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const MatchingPage = ({ datasetsInfo, onMatchingComplete, onNavigate }) => {
  const toast = useToast();

  const [matchingRunning, setMatchingRunning] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState(null); // 'idle', 'success', 'pending_pipeline', 'error'
  const [matchingMessage, setMatchingMessage] = useState(null);
  const [matchingResponse, setMatchingResponse] = useState(null);

  // Validation script state
  const [validating, setValidating] = useState(false);
  const [validationOutput, setValidationOutput] = useState(null);

  const allDatasetsUploaded = datasetsInfo?.all_uploaded || false;

  const handleRunMatching = async () => {
    if (!allDatasetsUploaded) {
      toast.error('Please upload all 3 source datasets first before running matching.');
      return;
    }

    setMatchingRunning(true);
    setMatchingStatus('running');
    setMatchingMessage(null);
    setMatchingResponse(null);

    try {
      const res = await api.runMatching();
      setMatchingStatus('success');
      setMatchingResponse(res);
      setMatchingMessage('Entity matching pipeline executed successfully!');
      toast.success('Matching pipeline completed!');
      onMatchingComplete();
    } catch (err) {
      if (err.isPipelineNotConnected || err.status === 503) {
        setMatchingStatus('pending_pipeline');
        setMatchingMessage(
          'Matching pipeline is currently being integrated. Please try again after the ML pipeline is connected.'
        );
        toast.info('ML pipeline is currently being integrated by Member 1 / Member 2.');
      } else {
        setMatchingStatus('error');
        setMatchingMessage(err.message || 'An error occurred while executing the matching pipeline.');
        toast.error(err.message || 'Matching execution failed');
      }
    } finally {
      setMatchingRunning(false);
    }
  };

  const handleRunValidation = async () => {
    setValidating(true);
    setValidationOutput(null);

    try {
      const res = await api.validateSubmission({});
      setValidationOutput(res);
      if (res.status === 'success' || res.exit_code === 0) {
        toast.success('Validation script passed successfully!');
      } else {
        toast.error('Validation script reported errors.');
      }
    } catch (err) {
      setValidationOutput({
        status: 'error',
        exit_code: err.status || 1,
        stderr: err.message,
      });
      toast.error(err.message || 'Validation execution failed');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Entity Resolution Pipeline Execution</h2>
        <p className="text-xs text-slate-500 mt-1">
          Execute cross-source entity linkage, candidate generation, and official submission verification.
        </p>
      </div>

      {/* Workflow Step Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Step 1</span>
            {allDatasetsUploaded ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="text-xs font-bold text-slate-900">Datasets Verification</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {allDatasetsUploaded ? '3 of 3 datasets ready' : 'Datasets incomplete'}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Step 2</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xs font-bold text-slate-900">ML Pipeline Hook</div>
          <div className="text-[11px] text-slate-500 mt-0.5">M1 / M2 integration layer</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Step 3</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xs font-bold text-slate-900">Output Generation</div>
          <div className="text-[11px] text-slate-500 mt-0.5">matching & candidates TSVs</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Step 4</span>
            <ShieldCheck className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xs font-bold text-slate-900">Challenge Validation</div>
          <div className="text-[11px] text-slate-500 mt-0.5">validate_submission.py</div>
        </div>
      </div>

      {/* Main Execution Card */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Execute Cross-Source Matching</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Invokes <code className="font-mono text-purple-700 bg-purple-50 px-1 py-0.5 rounded">POST /run-matching</code> against the backend engine.
            </p>
          </div>

          <button
            onClick={handleRunMatching}
            disabled={matchingRunning || !allDatasetsUploaded}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
          >
            {matchingRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Run Entity Matching
              </>
            )}
          </button>
        </div>

        {/* Dataset check banner */}
        {!allDatasetsUploaded && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Datasets must be uploaded first</div>
                <div className="text-amber-700 mt-0.5">
                  Source 1, Source 2, and Source 3 must be saved on the backend before the matching engine can process entity pairs.
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('datasets')}
              className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              Upload Now
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Graceful 503 Pipeline Not Connected State */}
        {matchingStatus === 'pending_pipeline' && (
          <div className="p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-purple-950">
                  Matching Pipeline Integration in Progress
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {matchingMessage}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  The backend service layer is active and ready. Once Member 1 & Member 2 register the ML pipeline via{' '}
                  <code className="bg-purple-100/70 text-purple-800 px-1 py-0.5 rounded font-mono">services/matching_service.py</code>,
                  matching will produce real challenge candidate pairs and evaluation metrics without needing any frontend changes.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {matchingStatus === 'success' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-emerald-900">{matchingMessage}</div>
              <p className="text-emerald-700">
                Generated {matchingResponse?.total_matches || 0} matched entity clusters and {matchingResponse?.total_candidates || 0} candidate pairs.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onNavigate('results')}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
                >
                  View Matching Results
                </button>
                <button
                  onClick={() => onNavigate('candidates')}
                  className="px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-50"
                >
                  View Candidate Pairs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {matchingStatus === 'error' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-900">Execution Error</div>
              <p className="text-rose-700 mt-0.5">{matchingMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Official Challenge Submission Validator */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Submission Format Validator</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Executes the official challenge script <code className="font-mono text-purple-700">utils/validate_submission.py</code> to verify schema, columns, and entity IDs.
            </p>
          </div>

          <button
            onClick={handleRunValidation}
            disabled={validating}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {validating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Validating Submission...
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5" />
                Run Submission Validation
              </>
            )}
          </button>
        </div>

        {/* Terminal output console */}
        {validationOutput && (
          <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs border border-slate-800 space-y-2 overflow-x-auto max-h-72">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Exit Code: <strong className={validationOutput.exit_code === 0 ? 'text-emerald-400' : 'text-rose-400'}>{validationOutput.exit_code}</strong></span>
              <span>Status: <strong className="uppercase">{validationOutput.status}</strong></span>
            </div>

            {validationOutput.stdout && (
              <pre className="text-emerald-300 whitespace-pre-wrap">{validationOutput.stdout}</pre>
            )}

            {validationOutput.stderr && (
              <pre className="text-rose-400 whitespace-pre-wrap">{validationOutput.stderr}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;

import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { resultsService } from '../../services/resultsService';
import { useApp } from '../../context/AppContext';

export const DownloadCard = () => {
  const { isMockMode, addToast, apiBaseUrl } = useApp();
  const [downloadingResults, setDownloadingResults] = useState(false);
  const [downloadingCandidates, setDownloadingCandidates] = useState(false);

  const handleDownloadResults = async () => {
    setDownloadingResults(true);
    try {
      await resultsService.downloadMatchingResults(isMockMode);
      addToast({
        type: 'success',
        title: 'Download Successful',
        message: 'matching_results.tsv downloaded from backend service.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Failed to download matching results.',
      });
    } finally {
      setDownloadingResults(false);
    }
  };

  const handleDownloadCandidates = async () => {
    setDownloadingCandidates(true);
    try {
      await resultsService.downloadCandidatePairs(isMockMode);
      addToast({
        type: 'success',
        title: 'Download Successful',
        message: 'candidate_pairs.tsv downloaded from backend service.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Failed to download candidate pairs.',
      });
    } finally {
      setDownloadingCandidates(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Matching Results TSV */}
      <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card flex flex-col justify-between hover:border-purple-300 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Matching Results TSV</h4>
              <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                .tsv
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Final resolved business entity mappings with Source 1 ID, matched Source 2/3 IDs, match counts and cluster decisions.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-400">
              Target: GET /download/matching-results
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-purple-100/60 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-600 font-medium">matching_results.tsv</span>
          <Button
            variant="success"
            size="sm"
            icon={Download}
            loading={downloadingResults}
            onClick={handleDownloadResults}
          >
            Download Results
          </Button>
        </div>
      </div>

      {/* Candidate Pairs TSV */}
      <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card flex flex-col justify-between hover:border-purple-300 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0 border border-purple-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Candidate Pairs TSV</h4>
              <span className="text-[11px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                .tsv
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete candidate blocking pairs with computed similarity features (name, address, country) and model probability scores.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-400">
              Target: GET /download/candidate-pairs
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-600 font-medium">candidate_pairs.tsv</span>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            loading={downloadingCandidates}
            onClick={handleDownloadCandidates}
          >
            Download Candidates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadCard;

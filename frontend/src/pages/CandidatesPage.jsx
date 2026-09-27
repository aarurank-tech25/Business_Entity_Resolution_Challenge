import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
} from 'lucide-react';
import api from '../api/api';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const CandidatesPage = ({ candidatesInfo, onRefresh }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [candidatesData, setCandidatesData] = useState(candidatesInfo || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowLimit, setRowLimit] = useState(25);

  const fetchCandidates = async (limit = rowLimit) => {
    setLoading(true);
    try {
      const res = await api.getCandidates(limit);
      setCandidatesData(res);
    } catch (err) {
      toast.error(err.message || 'Failed to load candidate pairs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(rowLimit);
  }, [rowLimit]);

  const fileExists = candidatesData?.exists || false;
  const rawPreview = candidatesData?.preview || [];

  // Filter preview rows by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rawPreview;
    const term = searchTerm.toLowerCase();
    return rawPreview.filter((row) => {
      const s1 = String(row.source1_entity_id || '').toLowerCase();
      const cands = String(row.candidate_entity_ids || '').toLowerCase();
      return s1.includes(term) || cands.includes(term);
    });
  }, [rawPreview, searchTerm]);

  const handleDownload = () => {
    if (!fileExists) {
      toast.error('candidate_pairs.tsv does not exist yet. Run the matching pipeline first.');
      return;
    }
    const downloadUrl = api.getCandidatesDownloadUrl();
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Pairs</h2>
            {fileExists ? (
              <Badge variant="emerald" size="sm">Available</Badge>
            ) : (
              <Badge variant="default" size="sm">Awaiting Pipeline</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Blocking stage entity pairs generated for detailed similarity comparison.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCandidates(rowLimit)}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh candidate pairs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            disabled={!fileExists}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Download candidate_pairs.tsv
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by entity ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs text-slate-500">
            <span>Rows:</span>
            <select
              value={rowLimit}
              onChange={(e) => setRowLimit(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
            <span>Loading candidate pairs preview...</span>
          </div>
        ) : !fileExists ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No Candidate Pairs Generated Yet</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              The <code className="font-mono text-purple-700">candidate_pairs.tsv</code> output will appear here once the matching pipeline executes its blocking phase.
            </p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            <p>No rows matched your search filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Total Rows in File: <strong className="text-slate-800">{candidatesData.total_rows?.toLocaleString() || 0}</strong>
              </span>
              <span>Showing {filteredRows.length} preview rows</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 sticky top-0 z-10">
                    <th className="py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                      source1_entity_id
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                      candidate_entity_ids
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
                  {filteredRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 text-purple-900 font-semibold whitespace-nowrap">
                        {row.source1_entity_id || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {row.candidate_entity_ids ? (
                          <div className="flex flex-wrap gap-1">
                            {String(row.candidate_entity_ids)
                              .split(',')
                              .map((id, idIdx) => (
                                <span
                                  key={idIdx}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px]"
                                >
                                  {id.trim()}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesPage;

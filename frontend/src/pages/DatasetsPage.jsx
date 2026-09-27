import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  HardDrive,
  FileText,
  Table,
} from 'lucide-react';
import api from '../api/api';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const DatasetsPage = ({ datasetsInfo, onRefreshDatasets }) => {
  const toast = useToast();

  const [files, setFiles] = useState({
    source1: null,
    source2: null,
    source3: null,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Preview state
  const [selectedPreviewSource, setSelectedPreviewSource] = useState('source1');
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewLimit, setPreviewLimit] = useState(10);

  const handleFileChange = (sourceName, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.tsv')) {
      toast.error(`${sourceName} must be a .tsv file`);
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [sourceName]: file,
    }));
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleUploadAll = async () => {
    if (!files.source1 || !files.source2 || !files.source3) {
      toast.error('Please select all three datasets (Source 1, Source 2, and Source 3) before uploading.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const res = await api.uploadDatasets({
        source1: files.source1,
        source2: files.source2,
        source3: files.source3,
      });

      setUploadSuccess(true);
      toast.success('All three datasets uploaded successfully to backend!');
      onRefreshDatasets();

      // Trigger preview of source1
      handleLoadPreview('source1');
    } catch (err) {
      setUploadError(err.message || 'Failed to upload datasets');
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadPreview = async (sourceName, limit = previewLimit) => {
    setSelectedPreviewSource(sourceName);
    setLoadingPreview(true);
    setPreviewError(null);

    try {
      const res = await api.getDatasetPreview(sourceName, limit);
      setPreviewData(res);
    } catch (err) {
      setPreviewData(null);
      setPreviewError(err.message || `Failed to preview ${sourceName}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const sources = [
    {
      id: 'source1',
      title: 'Source 1 (Master / Anchor)',
      desc: 'Primary business entity table containing entity_id, name, address, etc.',
      badge: 'Anchor Entity',
    },
    {
      id: 'source2',
      title: 'Source 2 (Secondary Vendor)',
      desc: 'Secondary business vendor directory with partial attribute overlaps.',
      badge: 'Secondary',
    },
    {
      id: 'source3',
      title: 'Source 3 (Tertiary Registry)',
      desc: 'Tertiary public or enterprise registry for cross-source linkage.',
      badge: 'Tertiary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dataset Ingestion & Inspection</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload and inspect TSV datasets safely with chunked disk streaming without overloading memory.
        </p>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((s) => {
          const file = files[s.id];
          const serverInfo = datasetsInfo?.datasets?.[s.id];
          const isUploadedOnServer = serverInfo?.exists;

          return (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-purple-100 p-5 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="purple" size="xs">{s.badge}</Badge>
                  {isUploadedOnServer ? (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved on backend
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Awaiting upload</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>

                {/* File picker */}
                <div className="mt-4">
                  <label
                    htmlFor={`file-${s.id}`}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      file
                        ? 'border-purple-300 bg-purple-50/40 text-purple-900'
                        : 'border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-purple-50/20 text-slate-600'
                    }`}
                  >
                    <UploadCloud className="w-6 h-6 mb-1 text-purple-600" />
                    <span className="text-xs font-semibold">
                      {file ? file.name : 'Select .tsv file'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Click to browse disk'}
                    </span>
                    <input
                      id={`file-${s.id}`}
                      type="file"
                      accept=".tsv"
                      onChange={(e) => handleFileChange(s.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Status on server */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Backend status:</span>
                {isUploadedOnServer ? (
                  <span className="font-mono text-slate-700 font-medium">
                    {serverInfo.filename} ({serverInfo.file_size_mb} MB)
                  </span>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            Datasets are streamed directly into <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-purple-800">backend/uploads/</code> using 1MB memory chunks.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onRefreshDatasets}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Status
          </button>

          <button
            onClick={handleUploadAll}
            disabled={uploading || (!files.source1 && !files.source2 && !files.source3)}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Streaming Datasets...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload All Datasets
              </>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong>Upload Error:</strong> {uploadError}
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All 3 datasets are safely uploaded and available on the backend server.</span>
        </div>
      )}

      {/* Dataset Preview Section */}
      <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dataset Row Preview</h3>
              <p className="text-[11px] text-slate-500">
                Inspect top rows with bounded <code className="font-mono text-purple-700">nrows</code> retrieval without reading full multi-hundred-MB files.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Source tabs */}
            <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              {['source1', 'source2', 'source3'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleLoadPreview(s)}
                  className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                    selectedPreviewSource === s
                      ? 'bg-white text-purple-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Limit selector */}
            <select
              value={previewLimit}
              onChange={(e) => {
                const lim = Number(e.target.value);
                setPreviewLimit(lim);
                handleLoadPreview(selectedPreviewSource, lim);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
            </select>

            <button
              onClick={() => handleLoadPreview(selectedPreviewSource)}
              disabled={loadingPreview}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Refresh preview"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        {loadingPreview ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
            <span>Streaming preview rows from backend...</span>
          </div>
        ) : previewError ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">{previewError}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Please upload <code className="font-mono text-purple-700">{selectedPreviewSource}.tsv</code> first to inspect its preview.
            </p>
          </div>
        ) : previewData?.data?.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Showing {previewData.preview_rows} rows from <strong className="text-slate-800">{previewData.filename}</strong></span>
              <span className="font-mono text-slate-400">{previewData.columns?.length || 0} columns detected</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 sticky top-0 z-10">
                    <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-10">#</th>
                    {previewData.columns?.map((col, idx) => (
                      <th
                        key={idx}
                        className="py-2 px-3 text-[11px] font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewData.data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-2 px-3 text-[10px] font-mono text-slate-400">{rowIdx + 1}</td>
                      {previewData.columns?.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className="py-2 px-3 text-slate-700 whitespace-nowrap max-w-xs truncate font-mono text-[11px]"
                          title={String(row[col] ?? '')}
                        >
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-300 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileSpreadsheet className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p>Click on any uploaded dataset source tab above to inspect its preview.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetsPage;

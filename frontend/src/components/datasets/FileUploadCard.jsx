import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const FileUploadCard = ({
  sourceKey,
  sourceTitle = 'Source 1',
  description = 'Master CRM records',
  acceptedFormats = '.csv,.tsv,.txt',
  currentStatus = { uploaded: false },
  onUpload,
  onRemove,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadState, setUploadState] = useState('empty'); // 'empty' | 'selected' | 'uploading' | 'uploaded' | 'failed'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Sync with current status if already uploaded
  const isUploaded = currentStatus?.uploaded || uploadState === 'uploaded';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    // Validate format
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.tsv') && !name.endsWith('.txt')) {
      setUploadState('failed');
      setErrorMessage('Invalid file format. Please upload a CSV or TSV file.');
      return;
    }

    setSelectedFile(file);
    setUploadState('selected');
    setErrorMessage('');
  };

  const triggerUpload = async () => {
    if (!selectedFile) return;
    setUploadState('uploading');
    setUploadProgress(10);

    try {
      await onUpload(sourceKey, selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      setUploadState('uploaded');
    } catch (err) {
      setUploadState('failed');
      setErrorMessage(err.message || 'File upload failed. Please verify the file format and try again.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadState('empty');
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove(sourceKey);
  };

  return (
    <div className="bg-white rounded-xl border border-purple-100 shadow-card overflow-hidden flex flex-col justify-between transition-all hover:border-purple-300">
      {/* Card Header */}
      <div className="p-4 border-b border-purple-100/70 flex items-center justify-between bg-purple-50/25">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">{sourceTitle}</h4>
            {isUploaded ? (
              <Badge variant="success" size="sm" dot>
                Uploaded
              </Badge>
            ) : uploadState === 'uploading' ? (
              <Badge variant="running" size="sm">
                Uploading...
              </Badge>
            ) : uploadState === 'selected' ? (
              <Badge variant="warning" size="sm">
                Ready to Upload
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Pending
              </Badge>
            )}
          </div>
          <p className="text-xs text-purple-900/60 mt-0.5">{description}</p>
        </div>

        <FileSpreadsheet className="w-5 h-5 text-purple-600" />
      </div>

      {/* Body / Upload Area */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        {isUploaded ? (
          /* State 4: Uploaded */
          <div className="rounded-lg bg-emerald-50/60 border border-emerald-200 p-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-900 truncate">
                  {currentStatus?.fileName || selectedFile?.name || `${sourceTitle} Dataset`}
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  {currentStatus?.rowCount ? `${currentStatus.rowCount.toLocaleString()} rows • ` : ''}
                  {currentStatus?.fileSize || (selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Ready for matching')}
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Drag and Drop Zone */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center ${
              dragActive
                ? 'border-purple-500 bg-purple-50/50'
                : 'border-purple-200/80 hover:border-purple-400 bg-purple-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={handleChange}
              className="hidden"
              id={`upload-${sourceKey}`}
            />

            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-200/60">
              <UploadCloud className="w-5 h-5" />
            </div>

            {uploadState === 'selected' ? (
              <div className="w-full">
                <p className="text-xs font-semibold text-slate-800 truncate px-2">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-purple-900/60 mt-0.5">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={triggerUpload}
                    loading={uploadState === 'uploading'}
                  >
                    Confirm Upload
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : uploadState === 'uploading' ? (
              <div className="w-full px-2">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-800 mb-1">
                  <span>Uploading to server...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor={`upload-${sourceKey}`}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
                >
                  Click to browse
                </label>
                <span className="text-xs text-purple-900/60"> or drag & drop</span>
                <p className="text-[11px] text-purple-400 mt-1">
                  Supports CSV, TSV (Max 50MB)
                </p>
              </div>
            )}
          </div>
        )}

        {/* State 5: Upload Failed Error Message */}
        {uploadState === 'failed' && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-2 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setUploadState('empty')} className="text-rose-600 hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata / Status */}
      <div className="px-5 py-2.5 bg-purple-50/20 border-t border-purple-100/60 flex items-center justify-between text-[11px] text-purple-900/60">
        <span>Target: FastAPI /upload</span>
        <span className="font-mono text-purple-700 font-semibold">{sourceKey}</span>
      </div>
    </div>
  );
};

export default FileUploadCard;

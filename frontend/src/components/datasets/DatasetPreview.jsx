import React, { useState } from 'react';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import EmptyState from '../common/EmptyState';
import Badge from '../common/Badge';
import { Eye, Layers, BarChart2, AlertCircle, Hash, Globe2 } from 'lucide-react';

export const DatasetPreview = ({ datasets, loading }) => {
  const [selectedSource, setSelectedSource] = useState('source1');

  const currentDataset = datasets?.[selectedSource];
  const previewRows = currentDataset?.previewData || [];

  // Adapt to whatever column names backend returns
  const dynamicColumns = React.useMemo(() => {
    if (!previewRows || previewRows.length === 0) return [];

    const firstRow = previewRows[0];
    const keys = Object.keys(firstRow);

    return keys.map((key) => {
      // Format header title from snake_case or camelCase
      const formattedHeader = key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      return {
        header: formattedHeader,
        accessor: key,
        sortable: true,
        render: (value) => {
          if (value === null || value === undefined || value === '') {
            return <span className="text-slate-400 italic font-mono text-xs">null</span>;
          }
          if (key.toLowerCase().includes('id')) {
            return <span className="font-mono font-medium text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded text-xs">{value}</span>;
          }
          if (key.toLowerCase().includes('country')) {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                {value}
              </span>
            );
          }
          return <span className="text-slate-800">{String(value)}</span>;
        },
      };
    });
  }, [previewRows]);

  const sourceLabels = {
    source1: 'Source 1 (Master)',
    source2: 'Source 2 (Secondary)',
    source3: 'Source 3 (Tertiary)',
  };

  return (
    <Card
      title="Dataset Inspection & Preview"
      subtitle="Inspect schema, data quality metrics, and sample record distribution"
      icon={Eye}
      loading={loading}
      actions={
        <div className="flex items-center gap-1 bg-purple-100/60 p-1 rounded-lg border border-purple-200/60">
          {['source1', 'source2', 'source3'].map((key) => (
            <button
              key={key}
              onClick={() => setSelectedSource(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedSource === key
                  ? 'bg-white text-purple-700 shadow-xs font-semibold'
                  : 'text-purple-900/70 hover:text-purple-950'
              }`}
            >
              {sourceLabels[key]}
            </button>
          ))}
        </div>
      }
    >
      {!currentDataset || !currentDataset.uploaded ? (
        <EmptyState
          icon={Layers}
          title={`No Records Loaded for ${sourceLabels[selectedSource]}`}
          description="Upload a CSV or TSV file above to preview records, columns, and country distribution."
        />
      ) : (
        <div className="space-y-5">
          {/* Metadata KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Total Rows
              </span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {currentDataset.rowCount?.toLocaleString() || '—'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Columns
              </span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {currentDataset.colCount || dynamicColumns.length || '—'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Missing Values
              </span>
              <div className="text-lg font-bold text-amber-700 mt-0.5">
                {currentDataset.missingValues !== undefined
                  ? currentDataset.missingValues.toLocaleString()
                  : '0'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Duplicates
              </span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {currentDataset.duplicateCount !== undefined
                  ? currentDataset.duplicateCount.toLocaleString()
                  : '0'}
              </div>
            </div>
          </div>

          {/* Optional Country Distribution from Backend */}
          {currentDataset.countryDistribution && currentDataset.countryDistribution.length > 0 && (
            <div className="p-3.5 rounded-lg bg-purple-50/40 border border-purple-200/80">
              <div className="text-xs font-semibold text-purple-950 mb-2 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Backend Country Distribution</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentDataset.countryDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs bg-white px-2.5 py-1 rounded-md border border-purple-200 shadow-xs"
                  >
                    <span className="text-slate-700">{item.country}:</span>
                    <span className="font-bold text-purple-700">{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Data Table */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>Sample Record Inspection ({previewRows.length} sample rows shown)</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentDataset.fileName || 'InMemory.csv'}
              </span>
            </div>
            <DataTable
              columns={dynamicColumns}
              data={previewRows}
              keyField={dynamicColumns[0]?.accessor || 'id'}
              defaultPageSize={5}
              pageSizeOptions={[5, 10]}
              showPagination={true}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default DatasetPreview;

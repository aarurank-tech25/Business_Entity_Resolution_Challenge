import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no records matching your query.',
  onRowClick,
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  showPagination = true,
  className = '',
}) => {
  const { tableDensity } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Density paddings
  const densityStyles = {
    compact: {
      th: 'py-2 px-3 text-[11px]',
      td: 'py-2 px-3 text-xs',
    },
    normal: {
      th: 'py-3 px-4 text-xs',
      td: 'py-3 px-4 text-sm',
    },
    comfortable: {
      th: 'py-4 px-5 text-xs',
      td: 'py-4.5 px-5 text-sm',
    },
  }[tableDensity || 'normal'];

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sorted and Paginated Data
  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  if (loading) {
    return <LoadingState message="Loading data table..." rows={5} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Table responsive container */}
      <div className="overflow-x-auto w-full border border-purple-100 rounded-xl bg-white shadow-card">
        <table className="w-full text-left border-collapse min-w-full">
          <thead className="bg-purple-50/50 border-b border-purple-100">
            <tr>
              {columns.map((col, idx) => {
                const isSortable = col.sortable !== false;
                const isCurrentSort = sortField === col.accessor;
                return (
                  <th
                    key={col.accessor || idx}
                    onClick={() => isSortable && col.accessor && handleSort(col.accessor)}
                    className={`font-semibold text-purple-950/80 uppercase tracking-wider ${densityStyles.th} ${
                      isSortable && col.accessor ? 'cursor-pointer hover:bg-purple-100/50 select-none' : ''
                    } ${col.headerClassName || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {isSortable && col.accessor && (
                        <span className="text-purple-300">
                          {isCurrentSort ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-purple-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50/80 bg-white">
            {paginatedData.map((row, rowIndex) => {
              const rowKey = row[keyField] || rowIndex;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-purple-50/50 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIndex) => {
                    const cellValue = col.accessor ? row[col.accessor] : undefined;
                    return (
                      <td
                        key={col.accessor || colIndex}
                        className={`text-slate-700 whitespace-nowrap ${densityStyles.td} ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(cellValue, row, rowIndex) : cellValue ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 mt-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="ml-2">
              Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{sortedData.length}</span> records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

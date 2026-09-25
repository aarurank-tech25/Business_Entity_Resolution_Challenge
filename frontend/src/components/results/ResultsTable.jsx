import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Badge from '../common/Badge';

export const ResultsTable = ({ results = [], loading }) => {
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.source1_id?.toLowerCase().includes(q) ||
        item.source1_name?.toLowerCase().includes(q) ||
        (Array.isArray(item.matched_ids) &&
          item.matched_ids.some((m) => m.toLowerCase().includes(q)));

      const matchDecision =
        decisionFilter === 'ALL' || item.decision === decisionFilter;

      return matchSearch && matchDecision;
    });
  }, [results, search, decisionFilter]);

  const columns = [
    {
      header: 'Source 1 Entity ID',
      accessor: 'source1_id',
      sortable: true,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded w-fit">
            {val}
          </span>
          {row.source1_name && (
            <span className="text-xs text-slate-800 font-medium mt-1 truncate max-w-xs" title={row.source1_name}>
              {row.source1_name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Matched Entity IDs',
      accessor: 'matched_ids',
      sortable: false,
      render: (ids) => {
        if (!ids || ids.length === 0) {
          return <span className="text-xs text-slate-400 italic">None (Singleton)</span>;
        }
        return (
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {ids.map((id) => (
              <span
                key={id}
                className="font-mono text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold"
              >
                {id}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Match Count',
      accessor: 'match_count',
      sortable: true,
      render: (count) => (
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
            count > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {count ?? 0}
        </span>
      ),
    },
    {
      header: 'Decision',
      accessor: 'decision',
      sortable: true,
      render: (decision) => (
        <Badge variant={decision === 'MATCH' ? 'match' : 'nomatch'} size="md" dot>
          {decision}
        </Badge>
      ),
    },
    {
      header: 'Score / Confidence',
      accessor: 'highest_score',
      sortable: true,
      render: (score, row) => (
        <div className="flex items-center gap-2">
          {typeof score === 'number' ? (
            <span className="font-mono text-xs font-bold text-slate-700">
              {(score * 100).toFixed(1)}%
            </span>
          ) : (
            <span className="text-slate-400 font-mono text-xs">—</span>
          )}
          {row.confidence && (
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              ({row.confidence})
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <Card bodyClassName="p-4" className="bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Source 1 ID, Business Name, or Matched ID..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Decisions (Matches & Singletons)</option>
              <option value="MATCH">Matches Only</option>
              <option value="NO MATCH">Singletons / No-Match Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <DataTable
        columns={columns}
        data={filteredResults}
        keyField="source1_id"
        loading={loading}
        emptyTitle="No Matching Results Found"
        emptyDescription="Execute the matching pipeline to produce resolved business entity results."
        defaultPageSize={10}
      />
    </div>
  );
};

export default ResultsTable;

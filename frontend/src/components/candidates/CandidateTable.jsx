import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Eye, Building2, MapPin, Globe, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Badge from '../common/Badge';
import SimilarityScore from './SimilarityScore';
import EntityDetailsModal from './EntityDetails';

export const CandidateTable = ({ candidates = [], loading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedDecision, setSelectedDecision] = useState('ALL');
  const [minScore, setMinScore] = useState(0);

  // Selected candidate pair for modal
  const [activeCandidateModal, setActiveCandidateModal] = useState(null);

  // Extract distinct countries
  const countries = useMemo(() => {
    const set = new Set();
    candidates.forEach((c) => {
      if (c.source1?.country) set.add(c.source1.country);
      if (c.candidate?.country) set.add(c.candidate.country);
    });
    return Array.from(set);
  }, [candidates]);

  // Filter logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.source1?.entity_id?.toLowerCase().includes(q) ||
        item.source1?.business_name?.toLowerCase().includes(q) ||
        item.candidate?.entity_id?.toLowerCase().includes(q) ||
        item.candidate?.business_name?.toLowerCase().includes(q);

      const matchCountry =
        selectedCountry === 'ALL' ||
        item.source1?.country === selectedCountry ||
        item.candidate?.country === selectedCountry;

      const matchDecision =
        selectedDecision === 'ALL' || item.decision === selectedDecision;

      const matchScore =
        minScore === 0 || (item.overall_score !== undefined && item.overall_score >= minScore / 100);

      return matchSearch && matchCountry && matchDecision && matchScore;
    });
  }, [candidates, search, selectedCountry, selectedDecision, minScore]);

  // Table columns definition
  const columns = [
    {
      header: 'Source 1 Master',
      accessor: 'source1',
      render: (s1) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">
            {s1?.entity_id}
          </span>
          <span className="text-xs font-medium text-slate-900 mt-1 max-w-[180px] truncate" title={s1?.business_name}>
            {s1?.business_name}
          </span>
        </div>
      ),
    },
    {
      header: 'Candidate Record',
      accessor: 'candidate',
      render: (cand) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              {cand?.entity_id}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">({cand?.source?.split(' ')[0] || 'Cand'})</span>
          </div>
          <span className="text-xs font-medium text-slate-900 mt-1 max-w-[180px] truncate" title={cand?.business_name}>
            {cand?.business_name}
          </span>
        </div>
      ),
    },
    {
      header: 'Location / Country',
      accessor: 'candidate_country',
      render: (_, row) => (
        <div className="text-xs text-slate-600 flex flex-col">
          <span>{row.candidate?.city || '—'}</span>
          <span className="text-[11px] text-slate-400">{row.candidate?.country || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Name Sim',
      accessor: 'name_similarity',
      sortable: true,
      render: (val) => <SimilarityScore score={val} showBar={false} />,
    },
    {
      header: 'Address Sim',
      accessor: 'address_similarity',
      sortable: true,
      render: (val) => <SimilarityScore score={val} showBar={false} />,
    },
    {
      header: 'Country',
      accessor: 'country_match',
      render: (val) =>
        val ? (
          <Badge variant="success" size="sm" dot>
            Match
          </Badge>
        ) : (
          <Badge variant="warning" size="sm" dot>
            Mismatch
          </Badge>
        ),
    },
    {
      header: 'Overall Score',
      accessor: 'overall_score',
      sortable: true,
      render: (val) => <SimilarityScore score={val} showBar={true} />,
    },
    {
      header: 'Decision',
      accessor: 'decision',
      sortable: true,
      render: (decision) => (
        <Badge variant={decision === 'MATCH' ? 'match' : 'nomatch'} size="md" dot>
          {decision || 'UNDECIDED'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveCandidateModal(row);
          }}
          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
          title="Compare records in detail"
          aria-label="Inspect candidate pair"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <Card bodyClassName="p-4" className="bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Entity ID or Business Name..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Decision Filter */}
          <div>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Decisions</option>
              <option value="MATCH">MATCH Only</option>
              <option value="NO MATCH">NO MATCH Only</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Min Score Slider */}
          <div className="flex flex-col justify-center px-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Min Score:</span>
              <span className="font-mono font-bold text-slate-700">{minScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Main Candidate Table */}
      <DataTable
        columns={columns}
        data={filteredCandidates}
        keyField="id"
        loading={loading}
        onRowClick={(row) => setActiveCandidateModal(row)}
        emptyTitle="No Candidate Pairs Found"
        emptyDescription="Execute the matching pipeline to generate candidate pairs, or adjust your search filters."
        defaultPageSize={10}
      />

      {/* Side-by-Side Detailed Comparison Modal */}
      <EntityDetailsModal
        isOpen={Boolean(activeCandidateModal)}
        candidatePair={activeCandidateModal}
        onClose={() => setActiveCandidateModal(null)}
      />
    </div>
  );
};

export default CandidateTable;

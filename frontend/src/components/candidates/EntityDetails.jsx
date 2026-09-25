import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import SimilarityScore from './SimilarityScore';
import { Building2, MapPin, Globe, CheckCircle2, XCircle, ArrowRightLeft, ShieldCheck } from 'lucide-react';

export const EntityDetailsModal = ({
  candidatePair,
  isOpen,
  onClose,
}) => {
  if (!candidatePair) return null;

  const s1 = candidatePair.source1 || {};
  const cand = candidatePair.candidate || {};
  const isMatch = candidatePair.decision === 'MATCH';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Pair Comparison"
      subtitle={`Source 1 (${s1.entity_id}) vs Candidate (${cand.entity_id})`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Scores calculated by backend ML model & feature pipeline</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Decision Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            isMatch
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {isMatch ? (
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                Pipeline Decision
              </div>
              <div className="text-base font-bold">
                {candidatePair.decision || 'UNDECIDED'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 mb-0.5">Overall Similarity</div>
            <SimilarityScore score={candidatePair.overall_score} size="lg" />
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source 1 Record */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-100">
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                  Source 1 (Master Entity)
                </span>
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {s1.entity_id || '—'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Business Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-start gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{s1.business_name || '—'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Address</span>
                  <div className="text-slate-700 mt-0.5 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{s1.address || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">City</span>
                    <span className="font-medium text-slate-800">{s1.city || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Country</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {s1.country || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Record */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {cand.source || 'Candidate Record'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {cand.entity_id || '—'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Business Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-start gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{cand.business_name || '—'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Address</span>
                  <div className="text-slate-700 mt-0.5 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{cand.address || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">City</span>
                    <span className="font-medium text-slate-800">{cand.city || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Country</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {cand.country || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Similarity Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Pair Feature Similarity Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Name Similarity</span>
              <div className="mt-1">
                <SimilarityScore score={candidatePair.name_similarity} />
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Address Similarity</span>
              <div className="mt-1">
                <SimilarityScore score={candidatePair.address_similarity} />
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Country Match</span>
              <div className="mt-1">
                {candidatePair.country_match ? (
                  <Badge variant="success" size="sm" dot>
                    Exact Match
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm" dot>
                    Mismatch
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EntityDetailsModal;

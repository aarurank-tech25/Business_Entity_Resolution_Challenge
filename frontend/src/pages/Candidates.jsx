import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import CandidateTable from '../components/candidates/CandidateTable';
import Button from '../components/common/Button';
import { candidateService } from '../services/candidateService';
import { useApp } from '../context/AppContext';
import { RefreshCw, Download, Users, FileText } from 'lucide-react';
import { resultsService } from '../services/resultsService';

export const Candidates = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { isMockMode, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [candidateList, setCandidateList] = useState([]);
  const [error, setError] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.getCandidates({}, isMockMode);
      setCandidateList(data?.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      setError(err.message || 'Unable to load candidate pairs.');
      setCandidateList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [isMockMode]);

  const handleDownloadCandidates = async () => {
    try {
      await resultsService.downloadCandidatePairs(isMockMode);
      addToast({
        type: 'success',
        title: 'Download Triggered',
        message: 'Downloading candidate_pairs.tsv...',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message,
      });
    }
  };

  return (
    <PageContainer
      title="Candidate Analysis"
      subtitle="Inspect candidate blocking pairs, feature similarities, and model classification decisions for Source 1 entities."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchCandidates}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownloadCandidates}
          >
            Export TSV
          </Button>
        </div>
      }
    >
      <CandidateTable
        candidates={candidateList}
        loading={loading}
        onRefresh={fetchCandidates}
      />
    </PageContainer>
  );
};

export default Candidates;

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import MetricsCards from '../components/results/MetricsCards';
import ResultsTable from '../components/results/ResultsTable';
import DownloadCard from '../components/results/DownloadCard';
import Button from '../components/common/Button';
import { resultsService } from '../services/resultsService';
import { useApp } from '../context/AppContext';
import { RefreshCw, Download, CheckCircle2 } from 'lucide-react';

export const Results = () => {
  const { isMockMode, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [error, setError] = useState(null);

  const fetchResultsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evalRes, resList] = await Promise.allSettled([
        resultsService.getEvaluationMetrics(isMockMode),
        resultsService.getResults({}, isMockMode),
      ]);

      if (evalRes.status === 'fulfilled') {
        setMetrics(evalRes.value?.metrics || null);
      } else {
        setMetrics(null);
      }

      if (resList.status === 'fulfilled') {
        setResultsList(resList.value?.items || (Array.isArray(resList.value) ? resList.value : []));
      } else {
        setResultsList([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsData();
  }, [isMockMode]);

  return (
    <PageContainer
      title="Matching Results"
      subtitle="Review final resolved entity clusters, evaluation metrics, and export submission files."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchResultsData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      }
    >
      {/* 7 Evaluation Metric KPI Cards */}
      <MetricsCards metrics={metrics} loading={loading} />

      {/* Download Cards for matching_results.tsv and candidate_pairs.tsv */}
      <DownloadCard />

      {/* Final Results Table */}
      <ResultsTable results={resultsList} loading={loading} />
    </PageContainer>
  );
};

export default Results;

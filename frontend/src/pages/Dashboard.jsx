import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import KPICard from '../components/dashboard/KPICard';
import MatchingOverview from '../components/dashboard/MatchingOverview';
import ModelPerformanceCard from '../components/dashboard/ModelPerformanceCard';
import ActivityList from '../components/dashboard/ActivityList';
import Button from '../components/common/Button';
import { resultsService } from '../services/resultsService';
import { datasetService } from '../services/datasetService';
import { useApp } from '../context/AppContext';
import {
  Users,
  Database,
  Layers,
  CheckCircle2,
  UserX,
  PlayCircle,
  RefreshCw,
  FolderUp,
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isMockMode, canRunMatching } = useApp();

  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState(null);
  const [overviewChart, setOverviewChart] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [datasetStats, setDatasetStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel requests for metrics and dataset statuses
      const [evalRes, datasetsRes] = await Promise.allSettled([
        resultsService.getEvaluationMetrics(isMockMode),
        datasetService.getDatasets(isMockMode),
      ]);

      if (evalRes.status === 'fulfilled') {
        const data = evalRes.value;
        setMetricsData(data?.metrics || null);
        setOverviewChart(data?.overview || []);
        setActivityLogs(data?.activity || []);
      } else {
        // In live mode when backend is offline, leave as null so "Waiting for backend data" appears
        setMetricsData(null);
        setOverviewChart([]);
        setActivityLogs([]);
      }

      if (datasetsRes.status === 'fulfilled') {
        setDatasetStats(datasetsRes.value);
      } else {
        setDatasetStats(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isMockMode]);

  return (
    <PageContainer
      title="Entity Resolution Dashboard"
      subtitle="Monitor datasets, matching activity and model performance across Source 1, 2, and 3."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDashboardData}
            loading={loading}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlayCircle}
            onClick={() => navigate('/run-matching')}
          >
            Run Pipeline
          </Button>
        </div>
      }
    >
      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Source 1 */}
        <KPICard
          label="Source 1 Records"
          value={metricsData?.source1Records ?? datasetStats?.source1?.rowCount}
          icon={Database}
          colorScheme="indigo"
          secondaryText="Master / target entities"
          loading={loading}
        />

        {/* Source 2 */}
        <KPICard
          label="Source 2 Records"
          value={metricsData?.source2Records ?? datasetStats?.source2?.rowCount}
          icon={Database}
          colorScheme="blue"
          secondaryText="Supplier / vendor records"
          loading={loading}
        />

        {/* Source 3 */}
        <KPICard
          label="Source 3 Records"
          value={metricsData?.source3Records ?? datasetStats?.source3?.rowCount}
          icon={Database}
          colorScheme="blue"
          secondaryText="Public directory records"
          loading={loading}
        />

        {/* Candidate Pairs */}
        <KPICard
          label="Candidate Pairs"
          value={metricsData?.candidatePairs}
          icon={Layers}
          colorScheme="slate"
          secondaryText="Blocking pairs evaluated"
          loading={loading}
        />

        {/* Final Matches */}
        <KPICard
          label="Final Matches"
          value={metricsData?.finalMatches}
          icon={CheckCircle2}
          colorScheme="emerald"
          secondaryText="High-confidence clusters"
          loading={loading}
        />

        {/* Singletons / No-Match */}
        <KPICard
          label="No-Match / Singletons"
          value={metricsData?.singletons}
          icon={UserX}
          colorScheme="amber"
          secondaryText="Isolated S1 entities"
          loading={loading}
        />
      </div>

      {/* Model Performance & Pipeline Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModelPerformanceCard metrics={metricsData} loading={loading} />
        <MatchingOverview data={overviewChart} loading={loading} />
      </div>

      {/* Recent Activity Table */}
      <ActivityList activities={activityLogs} loading={loading} />
    </PageContainer>
  );
};

export default Dashboard;

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import DatasetsPage from './pages/DatasetsPage';
import MatchingPage from './pages/MatchingPage';
import CandidatesPage from './pages/CandidatesPage';
import ResultsPage from './pages/ResultsPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import api from './api/api';
import { ToastProvider, useToast } from './context/ToastContext';

function MainApp() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'offline' | 'checking'
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Core backend state
  const [datasetsInfo, setDatasetsInfo] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [resultsInfo, setResultsInfo] = useState(null);
  const [candidatesInfo, setCandidatesInfo] = useState(null);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      await api.getHealth();
      setBackendStatus('healthy');
      return true;
    } catch (err) {
      setBackendStatus('offline');
      return false;
    }
  }, []);

  // Fetch all overview data concurrently
  const fetchAllData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const isHealthy = await checkHealth();

      if (isHealthy) {
        // Fetch all endpoints safely
        const [ds, met, res, cand] = await Promise.allSettled([
          api.getDatasets(),
          api.getMetrics(),
          api.getResults(10),
          api.getCandidates(10),
        ]);

        if (ds.status === 'fulfilled') setDatasetsInfo(ds.value);
        if (met.status === 'fulfilled') setMetricsData(met.value);
        if (res.status === 'fulfilled') setResultsInfo(res.value);
        if (cand.status === 'fulfilled') setCandidatesInfo(cand.value);

        if (isManualRefresh) {
          toast.success('System data refreshed');
        }
      } else if (isManualRefresh) {
        toast.error('Backend is unreachable at configured VITE_API_BASE_URL');
      }
    } catch (err) {
      if (isManualRefresh) {
        toast.error('Error refreshing system data');
      }
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, [checkHealth, toast]);

  useEffect(() => {
    fetchAllData(false);

    // Periodic lightweight health ping every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData, checkHealth]);

  const pageTitles = {
    overview: 'Overview Dashboard',
    datasets: 'Datasets & TSV Ingestion',
    matching: 'Pipeline Execution',
    candidates: 'Candidate Pairs',
    results: 'Matching Results',
    insights: 'Model Insights & Metrics',
    settings: 'Settings & Architecture',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8FF]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          activePageTitle={pageTitles[activeTab] || 'Overview'}
          backendStatus={backendStatus}
          onRefresh={() => fetchAllData(true)}
          refreshing={refreshing}
        />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <DashboardPage
                datasetsInfo={datasetsInfo}
                metricsData={metricsData}
                resultsInfo={resultsInfo}
                candidatesInfo={candidatesInfo}
                loading={initialLoading || refreshing}
                onNavigate={setActiveTab}
                onRefresh={() => fetchAllData(true)}
              />
            )}

            {activeTab === 'datasets' && (
              <DatasetsPage
                datasetsInfo={datasetsInfo}
                onRefreshDatasets={() => fetchAllData(true)}
              />
            )}

            {activeTab === 'matching' && (
              <MatchingPage
                datasetsInfo={datasetsInfo}
                onMatchingComplete={() => fetchAllData(true)}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'candidates' && (
              <CandidatesPage
                candidatesInfo={candidatesInfo}
                onRefresh={() => fetchAllData(true)}
              />
            )}

            {activeTab === 'results' && (
              <ResultsPage
                resultsInfo={resultsInfo}
                onRefresh={() => fetchAllData(true)}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsPage
                metricsData={metricsData}
                onRefresh={() => fetchAllData(true)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                backendStatus={backendStatus}
                onRefreshHealth={checkHealth}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;

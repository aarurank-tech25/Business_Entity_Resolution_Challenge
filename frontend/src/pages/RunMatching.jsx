import React, { useState, useEffect, useRef } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PipelineProgress, { PIPELINE_STAGES } from '../components/matching/PipelineProgress';
import MatchingStatus from '../components/matching/MatchingStatus';
import { matchingService } from '../services/matchingService';
import { resultsService } from '../services/resultsService';
import { useApp } from '../context/AppContext';
import { RefreshCw, PlayCircle, StopCircle } from 'lucide-react';
import Button from '../components/common/Button';

export const RunMatching = () => {
  const {
    isMockMode,
    datasetStatus,
    canRunMatching,
    lastMatchingRun,
    setLastMatchingRun,
    addToast,
  } = useApp();

  const [pipelineState, setPipelineState] = useState(() => {
    return lastMatchingRun?.status || 'idle'; // 'idle' | 'running' | 'completed' | 'failed'
  });
  const [currentStageIdx, setCurrentStageIdx] = useState(
    lastMatchingRun?.status === 'completed' ? 6 : 0
  );
  const [overallProgress, setOverallProgress] = useState(
    lastMatchingRun?.status === 'completed' ? 100 : 0
  );
  const [elapsedTime, setElapsedTime] = useState(null);
  const [pipelineError, setPipelineError] = useState(null);
  const timerRef = useRef(null);

  // Clean up any running timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartMatching = async () => {
    setPipelineState('running');
    setPipelineError(null);
    setCurrentStageIdx(0);
    setOverallProgress(5);
    const startTime = Date.now();

    // Start timer display
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 200);

    try {
      if (isMockMode) {
        // Step sequentially through pipeline stages for demo preview
        for (let i = 0; i < PIPELINE_STAGES.length; i++) {
          setCurrentStageIdx(i);
          setOverallProgress(Math.round(((i + 1) / PIPELINE_STAGES.length) * 100));
          await new Promise((res) => setTimeout(res, 600));
        }

        clearInterval(timerRef.current);
        const finalElapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(finalElapsed);
        setPipelineState('completed');
        setOverallProgress(100);

        setLastMatchingRun({
          executed: true,
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString(),
          jobId: 'mock-job-1042',
        });

        addToast({
          type: 'success',
          title: 'Matching Pipeline Completed',
          message: `Entity matching finished in ${finalElapsed.toFixed(1)}s (Mock Demo).`,
        });
      } else {
        // Real API execution
        const triggerRes = await matchingService.runMatching({
          source1: datasetStatus?.source1?.fileName,
          source2: datasetStatus?.source2?.fileName,
          source3: datasetStatus?.source3?.fileName,
        });

        const jobId = triggerRes.job_id;

        // If backend provides synchronous response or completed status
        if (triggerRes.status === 'Completed' || !jobId) {
          clearInterval(timerRef.current);
          const finalElapsed = (Date.now() - startTime) / 1000;
          setElapsedTime(triggerRes.elapsed_seconds || finalElapsed);
          setPipelineState('completed');
          setOverallProgress(100);
          setCurrentStageIdx(6);
          setLastMatchingRun({
            executed: true,
            status: 'completed',
            progress: 100,
            completedAt: new Date().toISOString(),
            jobId: jobId || 'sync-run',
          });
        } else {
          // Poll status if backend is asynchronous
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await matchingService.getMatchingStatus(jobId);
              if (statusRes.progress) setOverallProgress(statusRes.progress);
              if (statusRes.stage_index !== undefined) setCurrentStageIdx(statusRes.stage_index);

              if (statusRes.status === 'Completed') {
                clearInterval(pollInterval);
                clearInterval(timerRef.current);
                setPipelineState('completed');
                setOverallProgress(100);
                setCurrentStageIdx(6);
                setElapsedTime(statusRes.elapsed_seconds || (Date.now() - startTime) / 1000);
                setLastMatchingRun({
                  executed: true,
                  status: 'completed',
                  progress: 100,
                  completedAt: new Date().toISOString(),
                  jobId,
                });
              } else if (statusRes.status === 'Failed') {
                clearInterval(pollInterval);
                clearInterval(timerRef.current);
                setPipelineState('failed');
                setPipelineError(statusRes.message || 'Matching pipeline failed on backend.');
              }
            } catch (pollErr) {
              clearInterval(pollInterval);
              clearInterval(timerRef.current);
              setPipelineState('failed');
              setPipelineError(pollErr.message);
            }
          }, 1500);
        }
      }
    } catch (err) {
      clearInterval(timerRef.current);
      setPipelineState('failed');
      setPipelineError(err.message || 'Matching pipeline failed. Please review the backend logs or try again.');
      addToast({
        type: 'error',
        title: 'Pipeline Execution Error',
        message: err.message,
      });
    }
  };

  return (
    <PageContainer
      title="Run Entity Matching"
      subtitle="Execute the multi-source entity resolution pipeline on the uploaded datasets."
      actions={
        <div className="flex items-center gap-2">
          {pipelineState === 'running' && (
            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Pipeline in progress...
            </span>
          )}
        </div>
      }
    >
      {/* Pre-Run Summary & Action Controls */}
      <MatchingStatus
        datasetStatus={datasetStatus}
        onRunMatching={handleStartMatching}
        isRunning={pipelineState === 'running'}
        isCompleted={pipelineState === 'completed'}
      />

      {/* 7-Stage Pipeline Visualizer */}
      <PipelineProgress
        currentStageIndex={currentStageIdx}
        overallProgress={overallProgress}
        pipelineStatus={pipelineState}
        elapsedTime={elapsedTime}
        error={pipelineError}
      />
    </PageContainer>
  );
};

export default RunMatching;

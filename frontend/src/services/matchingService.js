import { apiClient, API_ENDPOINTS } from './api';

/**
 * Matching Pipeline Execution Service
 * Handles triggering candidate blocking, feature calculation, ML scoring and decision
 */

export const matchingService = {
  /**
   * Execute matching pipeline
   */
  async runMatching(config = {}, useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 400));
      return {
        job_id: 'job_' + Date.now(),
        status: 'Started',
        message: 'Entity Resolution pipeline job initiated',
        total_stages: 7,
      };
    }

    const res = await apiClient.post(API_ENDPOINTS.RUN_MATCHING, config);
    return res.data;
  },

  /**
   * Check status of matching pipeline run
   */
  async getMatchingStatus(jobId, useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return {
        job_id: jobId,
        status: 'Completed',
        current_stage: 'Result Generation',
        stage_index: 7,
        total_stages: 7,
        progress: 100,
        elapsed_seconds: 14.2,
      };
    }

    const res = await apiClient.get(API_ENDPOINTS.MATCHING_STATUS, {
      params: jobId ? { job_id: jobId } : {},
    });
    return res.data;
  },

  /**
   * Cancel in-flight job if backend supports it
   */
  async cancelMatching(jobId, useMock = false) {
    if (useMock) {
      return { success: true, message: 'Job cancelled' };
    }
    const res = await apiClient.post(API_ENDPOINTS.CANCEL_MATCHING, { job_id: jobId });
    return res.data;
  },
};

export default matchingService;

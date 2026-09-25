import { apiClient, API_ENDPOINTS, API_BASE_URL } from './api';
import { MOCK_RESULTS, MOCK_METRICS, MOCK_MATCHING_OVERVIEW, MOCK_RECENT_ACTIVITY } from '../mocks/mockData';

/**
 * Results & Metrics Service
 * Fetches final matches, evaluation metrics, and handles backend TSV file downloads
 */

export const resultsService = {
  /**
   * Get final matching results
   */
  async getResults(params = {}, useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      let items = [...MOCK_RESULTS];

      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(
          (r) =>
            r.source1_id.toLowerCase().includes(q) ||
            r.source1_name.toLowerCase().includes(q) ||
            r.matched_ids.some((m) => m.toLowerCase().includes(q))
        );
      }

      if (params.decision && params.decision !== 'ALL') {
        items = items.filter((r) => r.decision === params.decision);
      }

      return {
        total: items.length,
        items: items,
      };
    }

    const res = await apiClient.get(API_ENDPOINTS.RESULTS, { params });
    return res.data;
  },

  /**
   * Get Precision, Recall, F0.5, counts
   */
  async getEvaluationMetrics(useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 180));
      return {
        metrics: MOCK_METRICS,
        overview: MOCK_MATCHING_OVERVIEW,
        activity: MOCK_RECENT_ACTIVITY,
      };
    }

    const res = await apiClient.get(API_ENDPOINTS.METRICS);
    return res.data;
  },

  /**
   * Trigger backend download for matching_results.tsv
   */
  async downloadMatchingResults(useMock = false) {
    if (useMock) {
      // In mock preview, create a small sample TSV download
      const tsvContent = "source1_id\tmatched_ids\tmatch_count\tdecision\nS1-1001\tS2-9011,S3-401\t2\tMATCH\nS1-1002\tS2-9012\t1\tMATCH\nS1-1004\t\t0\tNO MATCH\n";
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'matching_results.tsv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    }

    // Call backend download endpoint directly via browser trigger or blob
    const downloadUrl = `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_MATCHING_RESULTS}`;
    window.open(downloadUrl, '_blank');
    return { success: true, url: downloadUrl };
  },

  /**
   * Trigger backend download for candidate_pairs.tsv
   */
  async downloadCandidatePairs(useMock = false) {
    if (useMock) {
      const tsvContent = "source1_id\tcandidate_id\tname_sim\taddr_sim\tcountry_match\toverall_score\tdecision\nS1-1001\tS2-9011\t0.94\t0.91\t1\t0.932\tMATCH\n";
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidate_pairs.tsv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    }

    const downloadUrl = `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_CANDIDATE_PAIRS}`;
    window.open(downloadUrl, '_blank');
    return { success: true, url: downloadUrl };
  },
};

export default resultsService;

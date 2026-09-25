import { apiClient, API_ENDPOINTS } from './api';
import { MOCK_CANDIDATES } from '../mocks/mockData';

/**
 * Candidate Analysis Service
 * Retrieve candidate pairs, similarity metrics, and pair-level details
 */

export const candidateService = {
  /**
   * Fetch candidate pairs with search, filters, pagination
   */
  async getCandidates(params = {}, useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 250));
      let results = [...MOCK_CANDIDATES];

      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (c) =>
            c.source1.entity_id.toLowerCase().includes(q) ||
            c.source1.business_name.toLowerCase().includes(q) ||
            c.candidate.business_name.toLowerCase().includes(q) ||
            c.candidate.entity_id.toLowerCase().includes(q)
        );
      }

      if (params.decision && params.decision !== 'ALL') {
        results = results.filter((c) => c.decision === params.decision);
      }

      if (params.country && params.country !== 'ALL') {
        results = results.filter((c) => c.source1.country === params.country || c.candidate.country === params.country);
      }

      if (params.minScore) {
        results = results.filter((c) => c.overall_score >= parseFloat(params.minScore));
      }

      return {
        total: results.length,
        items: results,
      };
    }

    const res = await apiClient.get(API_ENDPOINTS.CANDIDATES, { params });
    return res.data;
  },

  /**
   * Get single candidate pair detail
   */
  async getCandidatePair(id, useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 150));
      return MOCK_CANDIDATES.find((c) => c.id === id) || null;
    }

    const res = await apiClient.get(API_ENDPOINTS.CANDIDATE_PAIR(id));
    return res.data;
  },
};

export default candidateService;

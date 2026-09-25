import { apiClient, API_ENDPOINTS } from './api';
import { MOCK_MODEL_INSIGHTS } from '../mocks/mockData';

/**
 * Model Insights Service
 * Fetches feature importances, score distribution histogram, and model hyperparameters/status
 */

export const modelService = {
  async getModelInsights(useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return MOCK_MODEL_INSIGHTS;
    }

    const res = await apiClient.get(API_ENDPOINTS.MODEL_INSIGHTS);
    return res.data;
  },
};

export default modelService;

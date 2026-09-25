import axios from 'axios';

/**
 * Enterprise API Configuration for EntityResolve AI
 * Base URL configured via VITE_API_BASE_URL (defaults to http://localhost:8000)
 * Member 4 - Frontend REST Client
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Configurable endpoint mapping for backend integration
export const API_ENDPOINTS = {
  HEALTH: '/health',
  UPLOAD: '/upload',
  DATASETS: '/datasets',
  DATASET_PREVIEW: (sourceKey) => `/datasets/${sourceKey}/preview`,
  RUN_MATCHING: '/run-matching',
  MATCHING_STATUS: '/matching/status',
  CANCEL_MATCHING: '/matching/cancel',
  CANDIDATES: '/candidates',
  CANDIDATE_PAIR: (id) => `/candidates/${id}`,
  RESULTS: '/results',
  METRICS: '/metrics',
  MODEL_INSIGHTS: '/model-insights',
  DOWNLOAD_MATCHING_RESULTS: '/download/matching-results',
  DOWNLOAD_CANDIDATE_PAIRS: '/download/candidate-pairs',
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Allows dynamic custom headers if required later (e.g. auth tokens)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with normalized error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred while communicating with the server.';

    if (!error.response) {
      friendlyMessage = 'Unable to connect to the backend. Please check that the API server is running at ' + API_BASE_URL;
    } else if (error.response.status === 404) {
      friendlyMessage = 'The requested endpoint or resource was not found on the backend.';
    } else if (error.response.status === 500) {
      friendlyMessage = error.response.data?.detail || 'Internal server error in backend processing.';
    } else if (error.response.data?.detail) {
      friendlyMessage = error.response.data.detail;
    }

    const enhancedError = new Error(friendlyMessage);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;

    return Promise.reject(enhancedError);
  }
);

/**
 * Health check to verify backend connectivity
 */
export async function testApiConnection() {
  try {
    const res = await apiClient.get(API_ENDPOINTS.HEALTH, { timeout: 4000 });
    return { connected: true, data: res.data };
  } catch (err) {
    // If /health fails, try root / as fallback ping
    try {
      const fallback = await apiClient.get('/', { timeout: 3000 });
      return { connected: true, data: fallback.data };
    } catch {
      return {
        connected: false,
        error: 'Unable to connect to the backend. Please check that the API server is running.'
      };
    }
  }
}

export default apiClient;

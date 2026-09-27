/**
 * Centralized API client for Amazon Business Entity Resolution Challenge.
 * Connects directly to the FastAPI backend using VITE_API_BASE_URL.
 */

// Use empty string so requests go to relative paths (e.g., /health) when running via Vite dev proxy.
// Set VITE_API_BASE_URL in .env.production to point to the deployed backend.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status = null, data = null, isPipelineNotConnected = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isPipelineNotConnected = isPipelineNotConnected;
  }
}

/**
 * Core fetch wrapper with JSON parsing and standardized error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    ...options.headers,
  };

  // Only set Content-Type to JSON if not uploading FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const detail = data?.message || data?.detail || response.statusText;
      const isPipeline503 = response.status === 503 && typeof detail === 'string' && detail.toLowerCase().includes('not connected');
      
      const errorMessage = isPipeline503
        ? 'Matching pipeline is currently being integrated. Please try again after the ML pipeline is connected.'
        : detail || `Request failed with status ${response.status}`;

      throw new ApiError(errorMessage, response.status, data, isPipeline503);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network or connection error (e.g. backend offline or CORS blocked)
    const message = `Unable to reach backend at ${API_BASE_URL}. Ensure FastAPI is running.`;
    throw new ApiError(message, null, null, false);
  }
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

export const api = {
  /**
   * Health Check
   * GET /health
   */
  async getHealth() {
    return request('/health');
  },

  /**
   * List uploaded dataset metadata
   * GET /datasets
   */
  async getDatasets() {
    return request('/datasets');
  },

  /**
   * Preview a source dataset (source1, source2, or source3)
   * GET /datasets/{source_name}/preview?limit={limit}
   */
  async getDatasetPreview(sourceName, limit = 10) {
    return request(`/datasets/${encodeURIComponent(sourceName)}/preview?limit=${limit}`);
  },

  /**
   * Upload all 3 source datasets
   * POST /upload/
   * Expects files object { source1: File, source2: File, source3: File }
   */
  async uploadDatasets(files) {
    const formData = new FormData();
    if (files.source1) formData.append('source1', files.source1);
    if (files.source2) formData.append('source2', files.source2);
    if (files.source3) formData.append('source3', files.source3);

    return request('/upload/', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Execute ML matching pipeline
   * POST /run-matching
   */
  async runMatching() {
    return request('/run-matching', {
      method: 'POST',
    });
  },

  /**
   * Run official submission validation script
   * POST /validate
   */
  async validateSubmission(payload = {}) {
    return request('/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get matching results metadata and preview
   * GET /results?limit={limit}
   */
  async getResults(limit = 10) {
    return request(`/results?limit=${limit}`);
  },

  /**
   * Download matching_results.tsv
   */
  getResultsDownloadUrl() {
    return `${API_BASE_URL.replace(/\/$/, '')}/results/download`;
  },

  /**
   * Get candidate pairs metadata and preview
   * GET /candidates?limit={limit}
   */
  async getCandidates(limit = 10) {
    return request(`/candidates?limit=${limit}`);
  },

  /**
   * Download candidate_pairs.tsv
   */
  getCandidatesDownloadUrl() {
    return `${API_BASE_URL.replace(/\/$/, '')}/candidates/download`;
  },

  /**
   * Get real evaluation metrics
   * GET /metrics
   */
  async getMetrics() {
    return request('/metrics');
  },
};

export default api;

import { apiClient, API_ENDPOINTS } from './api';
import { MOCK_DATASET_STATUS } from '../mocks/mockData';

/**
 * Dataset Service for Source 1, Source 2, and Source 3
 * Member 4 - Frontend REST Client
 */

export const datasetService = {
  /**
   * Upload dataset file to backend
   * @param {string} sourceKey - 'source1' | 'source2' | 'source3'
   * @param {File} file
   * @param {Function} onUploadProgress - Axios progress callback
   * @param {boolean} useMock - whether preview mock mode is active
   */
  async uploadDataset(sourceKey, file, onUploadProgress, useMock = false) {
    if (useMock) {
      // Simulate network upload in development preview mode
      for (let p = 20; p <= 100; p += 20) {
        await new Promise((res) => setTimeout(res, 120));
        if (onUploadProgress) onUploadProgress({ loaded: p, total: 100 });
      }
      return {
        success: true,
        source: sourceKey,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        message: `Uploaded ${file.name} successfully (Mock Preview)`,
        metadata: MOCK_DATASET_STATUS[sourceKey] || { rowCount: 1000, colCount: 5 }
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', sourceKey);

    const res = await apiClient.post(API_ENDPOINTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          onUploadProgress(progressEvent);
        }
      },
    });
    return res.data;
  },

  /**
   * Fetch current dataset statuses across Source 1, 2, 3
   */
  async getDatasets(useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return MOCK_DATASET_STATUS;
    }
    const res = await apiClient.get(API_ENDPOINTS.DATASETS);
    return res.data;
  },

  /**
   * Get preview rows for a specific source
   */
  async getDatasetPreview(sourceKey, useMock = false) {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 150));
      return MOCK_DATASET_STATUS[sourceKey]?.previewData || [];
    }
    const res = await apiClient.get(API_ENDPOINTS.DATASET_PREVIEW(sourceKey));
    return res.data;
  },
};

export default datasetService;

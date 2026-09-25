import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Custom hook to execute API calls with standardized loading, error, and data states
 */
export function useApi(apiFn, options = {}) {
  const { immediate = true, initialData = null, onSuccess, onError } = options;
  const { isMockMode } = useApp();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        // Pass isMockMode as the last argument if the function accepts it
        const result = await apiFn(...args, isMockMode);
        setData(result);
        if (onSuccess) onSuccess(result);
        return { data: result, error: null };
      } catch (err) {
        setError(err);
        if (onError) onError(err);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [apiFn, isMockMode, onSuccess, onError]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
}

export default useApi;

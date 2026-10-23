import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';

export function useFetch(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.get(endpoint, options);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(err.message, 500));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (endpoint && isMounted) {
        setIsLoading(true);
        setError(null);
        
        try {
          const result = await api.get(endpoint, options);
          if (isMounted) {
            setData(result);
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof ApiError ? err : new ApiError(err.message, 500));
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [endpoint, options]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch };
}

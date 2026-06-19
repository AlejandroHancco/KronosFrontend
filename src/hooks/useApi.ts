import { useState, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (
    apiCall: () => Promise<T>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Ocurrió un error inesperado';
      setState({ data: null, loading: false, error: errorMessage });
      throw err;
    }
  }, []);

  const get = useCallback((path: string) => 
    request(() => apiClient.get<T>(path)), [request]);

  const post = useCallback((path: string, body?: any) => 
    request(() => apiClient.post<T>(path, body)), [request]);

  const put = useCallback((path: string, body?: any) => 
    request(() => apiClient.put<T>(path, body)), [request]);

  const del = useCallback((path: string) => 
    request(() => apiClient.del<T>(path)), [request]);

  return {
    ...state,
    get,
    post,
    put,
    del,
  };
}

import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    window.location.href = '/login';
    throw new Error('No active session');
  }

  const token = session.access_token;

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = await getHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Error ${response.status}: ${response.statusText}`);
  }

  // Si la respuesta está vacía (ej: 204 No Content), devolvemos null o un objeto vacío
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: any) => 
    request<T>(path, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  put: <T>(path: string, body?: any) => 
    request<T>(path, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

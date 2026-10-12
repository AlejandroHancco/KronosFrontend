import apiClient from './client';
import type { SearchResult } from '../types/search.types';

export const searchAll = async (q: string): Promise<SearchResult[]> => {
  const response = await apiClient.get('/search', { params: { q } });
  return response.data;
};

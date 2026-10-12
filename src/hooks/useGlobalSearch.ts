import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchAll } from '../api/search.api';

const DEBOUNCE_MS = 300;

/** Búsqueda global estilo GCP: debounce + fetch, lista para alimentar un dropdown. */
export const useGlobalSearch = (query: string) => {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const trimmed = debounced.trim();

  return useQuery({
    queryKey: ['global-search', trimmed],
    queryFn: () => searchAll(trimmed),
    enabled: trimmed.length > 1,
  });
};

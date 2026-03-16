import { useEffect, useState } from 'react';
import axios from 'axios';
import { fiiApi } from '../api';
import { useDebouncedValue } from './useDebouncedValue';

export function useTickerSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedQuery = useDebouncedValue(query.trim().toUpperCase(), 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();

    fiiApi
      .search(debouncedQuery, controller.signal)
      .then((response) => {
        setSuggestions(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error)) {
          return;
        }
        console.error('Erro ao buscar sugestoes de ticker:', error);
        setSuggestions([]);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  return {
    suggestions: debouncedQuery.length < 2 ? [] : suggestions,
    loadingSuggestions: false,
  };
}

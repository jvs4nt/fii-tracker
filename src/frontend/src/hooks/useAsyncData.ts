import { useCallback, useEffect, useState } from 'react';

interface UseAsyncDataOptions {
  immediate?: boolean;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  options?: UseAsyncDataOptions
) {
  const { immediate = true } = options ?? {};
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      setData(result);
      return result;
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Nao foi possivel carregar os dados.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    if (immediate) {
      void load();
    }
  }, [immediate, load]);

  return {
    data,
    loading,
    error,
    setData,
    setError,
    reload: load,
  };
}

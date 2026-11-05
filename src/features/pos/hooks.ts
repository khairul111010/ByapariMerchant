import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSale, SaleInput, searchPos } from './api';

/** Waits for the user to stop typing so slow connections are not flooded. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export const usePosSearch = (q: string) =>
  useQuery({ queryKey: ['pos-search', q], queryFn: () => searchPos(q), enabled: q.trim().length > 0, staleTime: 5_000 });

/** Never queued offline: the server takes stock at once, so a replay would double-sell. */
export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaleInput) => createSale(body),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['products'] });
      void qc.invalidateQueries({ queryKey: ['pos-search'] });
      void qc.invalidateQueries({ queryKey: ['low-stock'] });
      void qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

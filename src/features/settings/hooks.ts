import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAi,
  fetchGeneral,
  fetchMarketing,
  fetchPayments,
  saveAi,
  saveGeneral,
  saveMarketing,
  savePayments,
} from './api';

type Patch = Record<string, unknown>;

function useGroup<T>(
  key: string,
  fetcher: () => Promise<T>,
  saver: (p: Patch) => Promise<T>,
  alsoRefresh: string[] = [],
) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['settings', key], queryFn: fetcher });
  const save = useMutation({
    mutationFn: saver,
    onSuccess: fresh => {
      qc.setQueryData(['settings', key], fresh);
      // /me carries flags such as store.ai_configured and store.reviews_enabled.
      for (const k of alsoRefresh) {
        void qc.invalidateQueries({ queryKey: [k] });
      }
    },
  });
  return { query, save };
}

export const useGeneral = () =>
  useGroup('general', fetchGeneral, saveGeneral, ['me', 'reviews']);
export const usePayments = () =>
  useGroup('payments', fetchPayments, savePayments);
export const useAi = () => useGroup('ai', fetchAi, saveAi, ['me']);
export const useMarketing = () =>
  useGroup('marketing', fetchMarketing, saveMarketing);

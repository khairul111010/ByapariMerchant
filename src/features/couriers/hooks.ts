import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCouriers, saveCouriers } from './api';

export const useCouriers = () =>
  useQuery({ queryKey: ['couriers'], queryFn: fetchCouriers });

export function useSaveCouriers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) => saveCouriers(patch),
    onSuccess: fresh => {
      qc.setQueryData(['couriers'], fresh);
      // A configured driver appears in an order's available_drivers and in /me limits.
      void qc.invalidateQueries({ queryKey: ['me'] });
      void qc.invalidateQueries({ queryKey: ['order'] });
      void qc.invalidateQueries({ queryKey: ['plan'] });
    },
  });
}

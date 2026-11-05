import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchZones, updateZone } from './api';
import { toZonePayload } from './zoneForm';

export const useZones = () =>
  useQuery({ queryKey: ['zones'], queryFn: fetchZones });

export function useUpdateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { zone: string; body: ReturnType<typeof toZonePayload> }) =>
      updateZone(v.zone, v.body),
    onSettled: () => void qc.invalidateQueries({ queryKey: ['zones'] }),
  });
}

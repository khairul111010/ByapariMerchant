import { useQuery } from '@tanstack/react-query';
import { fetchPlan } from './api';

/** Owner-only (`/plan` is 403 for staff): pass `enabled: false` for staff. */
export const usePlan = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({ queryKey: ['plan'], queryFn: fetchPlan, enabled });

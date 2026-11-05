import { useQuery } from '@tanstack/react-query';
import { fetchPlan } from './api';

export const usePlan = () =>
  useQuery({ queryKey: ['plan'], queryFn: fetchPlan });

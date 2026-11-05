import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../store/session';
import { DashboardRange, fetchDashboard } from './api';

export function useDashboard(range: DashboardRange) {
  const signedIn = useSession(s => s.status === 'signedIn');
  return useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => fetchDashboard(range),
    enabled: signedIn,
    refetchInterval: 60_000, // numbers move as orders arrive; push is best-effort
  });
}

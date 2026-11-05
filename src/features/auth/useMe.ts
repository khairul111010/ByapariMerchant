import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../store/session';
import { fetchMe } from './api';

export const ME_KEY = ['me'] as const;

export function useMe() {
  const signedIn = useSession(s => s.status === 'signedIn');
  return useQuery({ queryKey: ME_KEY, queryFn: fetchMe, enabled: signedIn });
}

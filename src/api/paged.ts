import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { useSession } from '../store/session';

interface Page<T> {
  data: T[];
  meta: { current_page: number; last_page: number };
}

/** Infinite list for endpoints shaped `{data, meta:{current_page,last_page}}`. */
export function usePagedList<T, P extends Page<T>>(key: QueryKey, fetchPage: (page: number) => Promise<P>, enabled = true) {
  const signedIn = useSession((s) => s.status === 'signedIn');
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    enabled: signedIn && enabled,
  });
}

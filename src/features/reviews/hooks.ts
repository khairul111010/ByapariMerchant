import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePagedList } from '../../api/paged';
import { deleteReview, fetchReviews, moderateReview, ReviewStatus } from './api';

export const useReviews = (status: ReviewStatus) => usePagedList(['reviews', status], (page) => fetchReviews(status, page));

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: number; status: 'approved' | 'rejected' }) => moderateReview(v.id, v.status),
    onSettled: () => void qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => deleteReview(id), onSettled: () => void qc.invalidateQueries({ queryKey: ['reviews'] }) });
}

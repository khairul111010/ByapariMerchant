import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePagedList } from '../../api/paged';
import { deleteCart, fetchCarts } from './api';

export const useCarts = () => usePagedList(['carts'], fetchCarts);

export function useDeleteCart() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => deleteCart(id), onSettled: () => void qc.invalidateQueries({ queryKey: ['carts'] }) });
}

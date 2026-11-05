import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePagedList } from '../../api/paged';
import {
  CouponBody,
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  updateCoupon,
} from './api';

export const useCoupons = () => usePagedList(['coupons'], fetchCoupons);

export function useCouponMutations() {
  const qc = useQueryClient();
  const done = {
    onSettled: () => void qc.invalidateQueries({ queryKey: ['coupons'] }),
  };
  return {
    create: useMutation({
      mutationFn: (b: CouponBody) => createCoupon(b),
      ...done,
    }),
    update: useMutation({
      mutationFn: (v: { id: number; body: CouponBody }) =>
        updateCoupon(v.id, v.body),
      ...done,
    }),
    remove: useMutation({
      mutationFn: (id: number) => deleteCoupon(id),
      ...done,
    }),
  };
}

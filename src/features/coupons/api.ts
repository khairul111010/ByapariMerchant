import { z } from 'zod';
import { api } from '../../api/instance';
import {
  couponEnvelopeSchema,
  couponsPageSchema,
} from '../../api/schemas/selling';

export type CouponBody = ReturnType<
  typeof import('./couponForm').toCouponPayload
>;

export const fetchCoupons = (page: number) =>
  api.get('/coupons', { query: { page }, schema: couponsPageSchema });
export const createCoupon = (body: CouponBody) =>
  api
    .post('/coupons', { body, schema: couponEnvelopeSchema })
    .then(r => r.data);
export const updateCoupon = (id: number, body: CouponBody) =>
  api
    .put(`/coupons/${id}`, { body, schema: couponEnvelopeSchema })
    .then(r => r.data);
export const deleteCoupon = (id: number) =>
  api.delete(`/coupons/${id}`, { schema: z.unknown() });

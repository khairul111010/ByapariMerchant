import { z } from 'zod';
import { api } from '../../api/instance';
import {
  OrderStatus,
  orderEnvelopeSchema,
  ordersPageSchema,
} from '../../api/schemas/orders';

export interface OrderFilters {
  status?: OrderStatus;
  q?: string;
}

export const fetchOrders = (filters: OrderFilters, page: number) =>
  api.get('/orders', {
    query: { status: filters.status, q: filters.q, page, per_page: 20 },
    schema: ordersPageSchema,
  });

export const fetchOrder = (id: number) =>
  api.get(`/orders/${id}`, { schema: orderEnvelopeSchema }).then((r) => r.data);

export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api.put(`/orders/${id}/status`, { body: { status }, schema: z.unknown() });

export const verifyPayment = (id: number) =>
  api.put(`/orders/${id}/payment/verify`, { schema: orderEnvelopeSchema }).then((r) => r.data);

export const rejectPayment = (id: number) =>
  api.put(`/orders/${id}/payment/reject`, { schema: orderEnvelopeSchema }).then((r) => r.data);

export type AdvanceMethod = 'manual_bkash' | 'manual_nagad' | 'cash';

export const addAdvancePayment = (
  id: number,
  body: { method: AdvanceMethod; amount: string; reference_number?: string },
) =>
  api
    .post(`/orders/${id}/advance-payments`, { body, schema: orderEnvelopeSchema })
    .then((r) => r.data);

export const bookCourier = (id: number, driver: string) =>
  api.post(`/orders/${id}/courier/book`, { body: { driver }, schema: z.unknown() });

export const refreshCourier = (id: number) =>
  api.post(`/orders/${id}/courier/refresh`, { schema: z.unknown() });

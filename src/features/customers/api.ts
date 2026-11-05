import { api } from '../../api/instance';
import { customerEnvelopeSchema, customersPageSchema } from '../../api/schemas/selling';

export type CustomerSort = 'recent' | 'orders' | 'spent';

export const fetchCustomers = (q: string | undefined, sort: CustomerSort, page: number) =>
  api.get('/customers', { query: { q, sort, page, per_page: 20 }, schema: customersPageSchema });

export const fetchCustomer = (phone: string) =>
  api.get(`/customers/${encodeURIComponent(phone)}`, { schema: customerEnvelopeSchema }).then((r) => r.data);

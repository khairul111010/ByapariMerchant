import { z } from 'zod';
import { api } from '../../api/instance';
import { abandonedCartsPageSchema } from '../../api/schemas/selling';

export const fetchCarts = (page: number) => api.get('/abandoned-carts', { query: { page }, schema: abandonedCartsPageSchema });
export const deleteCart = (id: number) => api.delete(`/abandoned-carts/${id}`, { schema: z.unknown() });

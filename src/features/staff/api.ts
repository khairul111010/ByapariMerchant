import { z } from 'zod';
import { api } from '../../api/instance';
import {
  staffEnvelopeSchema,
  staffListSchema,
} from '../../api/schemas/settings';

export const fetchStaff = () => api.get('/staff', { schema: staffListSchema });
export const createStaff = (body: Record<string, string>) =>
  api.post('/staff', { body, schema: staffEnvelopeSchema }).then(r => r.data);
export const updateStaff = (id: number, body: Record<string, string>) =>
  api
    .put(`/staff/${id}`, { body, schema: staffEnvelopeSchema })
    .then(r => r.data);
export const deleteStaff = (id: number) =>
  api.delete(`/staff/${id}`, { schema: z.unknown() });

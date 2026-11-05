import { api } from '../../api/instance';
import { couriersEnvelopeSchema } from '../../api/schemas/settings';

export const fetchCouriers = () =>
  api
    .get('/settings/couriers', { schema: couriersEnvelopeSchema })
    .then(r => r.data);

/** Flat partial body of every changed driver field and any typed secret; `clear` removes secrets. */
export const saveCouriers = (patch: Record<string, unknown>) =>
  api
    .put('/settings/couriers', { body: patch, schema: couriersEnvelopeSchema })
    .then(r => r.data);

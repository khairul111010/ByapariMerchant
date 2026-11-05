import { api } from '../../api/instance';
import {
  aiEnvelopeSchema,
  generalEnvelopeSchema,
  marketingEnvelopeSchema,
  paymentsEnvelopeSchema,
} from '../../api/schemas/settings';

type Patch = Record<string, unknown>;

// All settings endpoints are owner-only and partial: only the keys sent change.
export const fetchGeneral = () =>
  api.get('/settings', { schema: generalEnvelopeSchema }).then(r => r.data);
export const saveGeneral = (patch: Patch) =>
  api
    .put('/settings', { body: patch, schema: generalEnvelopeSchema })
    .then(r => r.data);

export const fetchPayments = () =>
  api
    .get('/settings/payments', { schema: paymentsEnvelopeSchema })
    .then(r => r.data);
export const savePayments = (patch: Patch) =>
  api
    .put('/settings/payments', { body: patch, schema: paymentsEnvelopeSchema })
    .then(r => r.data);

export const fetchAi = () =>
  api.get('/settings/ai', { schema: aiEnvelopeSchema }).then(r => r.data);
export const saveAi = (patch: Patch) =>
  api
    .put('/settings/ai', { body: patch, schema: aiEnvelopeSchema })
    .then(r => r.data);

export const fetchMarketing = () =>
  api.get('/marketing', { schema: marketingEnvelopeSchema }).then(r => r.data);
export const saveMarketing = (patch: Patch) =>
  api
    .put('/marketing', { body: patch, schema: marketingEnvelopeSchema })
    .then(r => r.data);

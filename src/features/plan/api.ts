import { api } from '../../api/instance';
import { planEnvelopeSchema } from '../../api/schemas/settings';

/** Read-only. There is no self-serve billing: upgrades and renewals are WhatsApp links. */
export const fetchPlan = () =>
  api.get('/plan', { schema: planEnvelopeSchema }).then(r => r.data);

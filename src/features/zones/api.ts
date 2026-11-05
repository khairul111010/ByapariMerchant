import { api } from '../../api/instance';
import {
  deliveryZoneEnvelopeSchema,
  deliveryZonesSchema,
} from '../../api/schemas/selling';
import { toZonePayload } from './zoneForm';

export const fetchZones = () =>
  api.get('/delivery-zones', { schema: deliveryZonesSchema }).then(r => r.data);
export const updateZone = (
  zone: string,
  body: ReturnType<typeof toZonePayload>,
) =>
  api
    .put(`/delivery-zones/${zone}`, {
      body,
      schema: deliveryZoneEnvelopeSchema,
    })
    .then(r => r.data);

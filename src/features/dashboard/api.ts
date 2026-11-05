import { api } from '../../api/instance';
import { dashboardEnvelopeSchema } from '../../api/schemas/storefront';

export type DashboardRange =
  | { kind: 'days'; days: 7 | 30 | 90 }
  | { kind: 'custom'; from: string; to: string };

/** `range` accepts 7, 30 or 90 only; a custom range sends both `from` and `to` (max one year). */
export const fetchDashboard = (r: DashboardRange) =>
  api
    .get('/dashboard', {
      query: r.kind === 'days' ? { range: r.days } : { from: r.from, to: r.to },
      schema: dashboardEnvelopeSchema,
    })
    .then(x => x.data);

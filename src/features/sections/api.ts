import { z } from 'zod';
import { api } from '../../api/instance';
import {
  homeSectionDetailEnvelopeSchema,
  homeSectionEnvelopeSchema,
  homeSectionsSchema,
  sectionPreviewSchema,
} from '../../api/schemas/storefront';
import { toSectionPayload } from './sectionForm';

type Body = ReturnType<typeof toSectionPayload>;
export type Direction = 'up' | 'down';

export const fetchSections = () =>
  api.get('/home-sections', { schema: homeSectionsSchema });
export const fetchSection = (id: number) =>
  api
    .get(`/home-sections/${id}`, { schema: homeSectionDetailEnvelopeSchema })
    .then(r => r.data);
export const fetchPreview = (id: number) =>
  api
    .get(`/home-sections/${id}/preview`, { schema: sectionPreviewSchema })
    .then(r => r.data);

export const createSection = (body: Body) =>
  api
    .post('/home-sections', { body, schema: homeSectionEnvelopeSchema })
    .then(r => r.data);
// Update/move/remove replies are not in the samples; callers re-read the list or section afterwards.
export const updateSection = (id: number, body: Body) =>
  api.put(`/home-sections/${id}`, { body, schema: z.unknown() });
export const moveSection = (id: number, direction: Direction) =>
  api.post(`/home-sections/${id}/move`, {
    body: { direction },
    schema: z.unknown(),
  });
export const deleteSection = (id: number) =>
  api.delete(`/home-sections/${id}`, { schema: z.unknown() });

/** Idempotent; the server allows at most `limits.max_picks` (24) per section. */
export const addPick = (id: number, productId: number) =>
  api
    .post(`/home-sections/${id}/products`, {
      body: { product_id: productId },
      schema: homeSectionDetailEnvelopeSchema,
    })
    .then(r => r.data);
export const removePick = (id: number, pickId: number) =>
  api.delete(`/home-sections/${id}/products/${pickId}`, {
    schema: z.unknown(),
  });
export const movePick = (id: number, pickId: number, direction: Direction) =>
  api.post(`/home-sections/${id}/products/${pickId}/move`, {
    body: { direction },
    schema: z.unknown(),
  });

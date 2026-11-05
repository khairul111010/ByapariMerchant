import { z } from 'zod';
import { api } from '../../api/instance';
import {
  landingImageEnvelopeSchema,
  landingPageEnvelopeSchema,
  landingPagesPageSchema,
  testimonialEnvelopeSchema,
} from '../../api/schemas/selling';
import type { PreparedImage } from '../../media/prepare';

export const fetchLandingPages = (page: number) =>
  api.get('/landing-pages', {
    query: { page },
    schema: landingPagesPageSchema,
  });
export const fetchLandingPage = (id: number) =>
  api
    .get(`/landing-pages/${id}`, { schema: landingPageEnvelopeSchema })
    .then(r => r.data);

function formOf(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    form.append(k, v);
  }
  return form;
}

/** Create and update are multipart POSTs (PHP cannot parse a multipart PUT). */
export const saveLandingPage = (
  id: number | null,
  fields: Record<string, string>,
) =>
  api
    .upload(
      id === null ? '/landing-pages' : `/landing-pages/${id}`,
      formOf(fields),
      { schema: landingPageEnvelopeSchema },
    )
    .then(r => r.data);

export const deleteLandingPage = (id: number) =>
  api.delete(`/landing-pages/${id}`, { schema: z.unknown() });

export function uploadLandingImage(
  id: number,
  image: PreparedImage,
  onProgress?: (f: number) => void,
) {
  const form = new FormData();
  form.append('image', {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as unknown as Blob);
  return api
    .upload(`/landing-pages/${id}/images`, form, {
      schema: landingImageEnvelopeSchema,
      onProgress,
    })
    .then(r => r.data);
}
export const deleteLandingImage = (id: number, mediaId: number) =>
  api.delete(`/landing-pages/${id}/images/${mediaId}`, { schema: z.unknown() });

export const addTestimonial = (
  id: number,
  body: { author_name: string; quote: string },
) =>
  api
    .post(`/landing-pages/${id}/testimonials`, {
      body,
      schema: testimonialEnvelopeSchema,
    })
    .then(r => r.data);
export const deleteTestimonial = (id: number, tid: number) =>
  api.delete(`/landing-pages/${id}/testimonials/${tid}`, {
    schema: z.unknown(),
  });

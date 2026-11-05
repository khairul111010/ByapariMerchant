import { z } from 'zod';
import { api } from '../../api/instance';
import { reviewEnvelopeSchema, reviewsPageSchema } from '../../api/schemas/selling';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export const fetchReviews = (status: ReviewStatus, page: number) =>
  api.get('/reviews', { query: { status, page }, schema: reviewsPageSchema });

/** `rejected` on an approved review unpublishes it. There is no way to write or edit a review. */
export const moderateReview = (id: number, status: 'approved' | 'rejected') =>
  api.put(`/reviews/${id}`, { body: { status }, schema: reviewEnvelopeSchema }).then((r) => r.data);

export const deleteReview = (id: number) => api.delete(`/reviews/${id}`, { schema: z.unknown() });

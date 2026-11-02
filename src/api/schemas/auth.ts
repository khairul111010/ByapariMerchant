import { z } from 'zod';

// The contract names these payloads but does not list every field of `limits`
// or `store`/`user` beyond the ones the app relies on (see "Gaps" in
// docs/api-contract.md). Unknown keys are kept, known ones are validated.

export const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    is_owner: z.boolean(),
  })
  .passthrough();

export const storeSchema = z
  .object({
    api_base_url: z.string(),
    is_pending: z.boolean(),
    name: z.string().optional(),
    subdomain: z.string().optional(),
    ai_configured: z.boolean().optional(),
    reviews_enabled: z.boolean().optional(),
  })
  .passthrough();

export const limitsSchema = z.record(z.string(), z.unknown());

export const platformSchema = z
  .object({ support_whatsapp_url: z.string().nullable().optional() })
  .passthrough();

/** `/me` */
export const meSchema = z.object({
  user: userSchema,
  store: storeSchema,
  limits: limitsSchema,
  platform: platformSchema,
  unread_notifications: z.number(),
});

/** login and signup: `/me` plus a token. */
export const sessionPayloadSchema = meSchema.extend({
  token: z.string().min(1),
});

export type User = z.infer<typeof userSchema>;
export type Store = z.infer<typeof storeSchema>;
export type Me = z.infer<typeof meSchema>;
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

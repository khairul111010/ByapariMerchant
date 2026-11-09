import { z } from 'zod';

// The contract names these payloads but does not list every field of `limits`
// or `store`/`user` beyond the ones the app relies on (see "Gaps" in
// docs/api-contract.md). Unknown keys are kept, known ones are validated.

export const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    // An owner may register with a phone only, so either of these can be null (not both).
    email: z.string().nullable(),
    phone: z.string().nullable().optional(),
    is_owner: z.boolean(),
    roles: z.array(z.string()).optional(),
  })
  .passthrough();

export const storeSchema = z
  .object({
    api_base_url: z.string(),
    is_pending: z.boolean(),
    status: z.string().optional(),
    name: z.string().optional(),
    subdomain: z.string().optional(),
    storefront_url: z.string().optional(),
    ai_configured: z.boolean().optional(),
    reviews_enabled: z.boolean().optional(),
  })
  .passthrough();

export const limitsSchema = z
  .object({
    max_staff_accounts: z.number().nullable(),
    can_add_staff_account: z.boolean(),
    custom_domain_enabled: z.boolean(),
    courier_drivers: z.array(z.string()),
    configured_courier_drivers: z.array(z.string()),
  })
  .passthrough();

export const platformSchema = z
  .object({
    support_whatsapp: z.string().nullable().optional(),
    support_whatsapp_url: z.string().nullable().optional(),
  })
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

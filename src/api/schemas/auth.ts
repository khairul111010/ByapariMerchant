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
    // Free trial (Starter only). Optional so an older cached `/me` still parses.
    is_trial: z.boolean().optional(),
    trial_ends_at: z.string().nullable().optional(),
    // Buyers can't reach the shop: pending payment, or the trial ended unpaid.
    storefront_closed: z.boolean().optional(),
    plan: z.string().optional(),
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
    // Products are a hard cap; orders per month are a soft limit that only ever warns.
    max_products: z.number().nullable().optional(), // null = unlimited
    can_add_product: z.boolean().optional(),
    max_orders_per_month: z.number().nullable().optional(), // null = unlimited
    order_limit_state: z.enum(['ok', 'near', 'over']).optional(),
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
export type Limits = z.infer<typeof limitsSchema>;
export type Me = z.infer<typeof meSchema>;
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

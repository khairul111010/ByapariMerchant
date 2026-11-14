import { z } from 'zod';

const amount = z.union([z.number(), z.string()]);

/* ---------- General ---------- */
export const generalSettingsSchema = z.object({
  name: z.string(),
  subdomain: z.string(),
  category: z.string(),
  whatsapp_number: z.string().nullable(),
  reviews_enabled: z.boolean(),
  show_platform_credit: z.boolean(),
});
export const generalEnvelopeSchema = z.object({ data: generalSettingsSchema });
export type GeneralSettings = z.infer<typeof generalSettingsSchema>;

/* ---------- Payments (secrets are write-only: only the *_set flag comes back) ---------- */
export const paymentsSchema = z.object({
  sslcommerz_store_id: z.string().nullable(),
  sslcommerz_store_password_set: z.boolean(),
  sslcommerz_configured: z.boolean(),
  bkash_number: z.string().nullable(),
  nagad_number: z.string().nullable(),
  available_payment_methods: z.array(z.string()),
});
export const paymentsEnvelopeSchema = z.object({ data: paymentsSchema });
export type PaymentSettings = z.infer<typeof paymentsSchema>;

/* ---------- Couriers ---------- */
export const courierSchema = z.object({
  driver: z.string(),
  label: z.string(),
  plan_allows: z.boolean(),
  configured: z.boolean(),
  fields: z.record(z.string(), z.string().nullable()),
  secrets_set: z.record(z.string(), z.boolean()),
});
export const couriersEnvelopeSchema = z.object({ data: z.array(courierSchema) });
export type Courier = z.infer<typeof courierSchema>;

/* ---------- AI ---------- */
export const AI_PROVIDERS = ['anthropic', 'openai'] as const;
export const aiSchema = z.object({
  ai_provider: z.string().nullable(),
  ai_api_key_set: z.boolean(),
  configured: z.boolean(),
});
export const aiEnvelopeSchema = z.object({ data: aiSchema });
export type AiSettings = z.infer<typeof aiSchema>;

/* ---------- Marketing ---------- */
export const marketingSchema = z.object({
  facebook_pixel_id: z.string().nullable(),
  facebook_conversions_api_configured: z.boolean(),
  ga4_measurement_id: z.string().nullable(),
  gtm_container_id: z.string().nullable(),
  tiktok_pixel_id: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  google_site_verification: z.string().nullable(),
});
export const marketingEnvelopeSchema = z.object({ data: marketingSchema });
export type MarketingSettings = z.infer<typeof marketingSchema>;

/* ---------- Domains ---------- */
export const domainSchema = z.object({
  id: z.number(),
  domain: z.string(),
  status: z.string(), // pending_verification | verified
  verified_at: z.string().nullable(),
  is_primary: z.boolean(),
  ssl_status: z.string().nullable(),
  dns: z.object({
    zone: z.string(),
    verification: z.object({ type: z.string(), host: z.string(), full_name: z.string(), value: z.string() }),
    routing: z.object({ type: z.string(), host: z.string(), value: z.string().nullable(), value_hint: z.string().nullable() }),
    notes: z.array(z.string()),
  }),
});
export const domainsSchema = z.object({
  custom_domain_enabled: z.boolean(),
  addon_price_yearly: amount.nullable(),
  addon_expires_at: z.string().nullable(),
  data: z.array(domainSchema),
});
export const domainEnvelopeSchema = z.object({ data: domainSchema });
export const verifyDomainSchema = z.object({
  verified: z.boolean(),
  message: z.string(),
  misplaced_record: z.string().nullable().optional(), // absent when verified
  data: domainSchema,
});
export type Domain = z.infer<typeof domainSchema>;

/* ---------- Staff ---------- */
export const staffMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(), // a phone-only owner has no email
  phone: z.string().nullable().optional(),
  role: z.enum(['owner', 'staff']),
  created_at: z.string(),
});
export const staffListSchema = z.object({
  max_staff_accounts: z.number().nullable(), // null = unlimited
  can_add_staff_account: z.boolean(),
  data: z.array(staffMemberSchema),
});
export const staffEnvelopeSchema = z.object({ data: staffMemberSchema });
export type StaffMember = z.infer<typeof staffMemberSchema>;

/* ---------- Plan (read-only; upgrades and renewals are WhatsApp links, never payments) ---------- */
const planOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  blurb: z.string().nullable(),
  price_yearly: amount,
  price_monthly_quote: amount,
  staff_accounts: z.number().nullable(),
  products: z.number().nullable(), // hard cap, null = unlimited
  orders_per_month: z.number().nullable(), // soft limit, null = unlimited
  has_trial: z.boolean(),
  trial_days: z.number(),
  custom_domain_included: z.boolean(),
  courier_drivers: z.array(z.string()),
});
export const PLAN_STATES = ['trial', 'trial_expired', 'pending', 'active', 'overdue', 'suspended', 'cancelled'] as const;
export type PlanState = (typeof PLAN_STATES)[number];
const usageSchema = z.object({ used: z.number(), max: z.number().nullable() }); // max null = unlimited
export const ORDER_LIMIT_STATES = ['ok', 'near', 'over'] as const;
export type OrderLimitState = (typeof ORDER_LIMIT_STATES)[number];
export const historyRowSchema = z.object({
  date: z.string(),
  label: z.string(),
  period_from: z.string().nullable(),
  period_to: z.string().nullable(),
  amount: z.number().nullable(), // BDT; 0 = the free trial, null = not recorded
  payment_reference: z.string().nullable(),
});
export type HistoryRow = z.infer<typeof historyRowSchema>;
export const planSchema = z.object({
  plan: planOptionSchema.extend({
    status: z.string(),
    // An unknown future state shows as a neutral badge instead of failing the whole screen.
    state: z.string(),
    is_pending: z.boolean(),
    is_trial: z.boolean(),
    trial_expired: z.boolean(),
    storefront_closed: z.boolean(),
    trial_ends_at: z.string().nullable(),
    trial_days_left: z.number().nullable(),
  }),
  renewal: z.object({ expires_at: z.string().nullable(), overdue: z.boolean(), days_left: z.number().nullable() }),
  usage: z.object({
    staff_accounts: usageSchema,
    products: usageSchema,
    orders: usageSchema.extend({ state: z.enum(ORDER_LIMIT_STATES) }),
    courier_drivers: z.object({ enabled: z.array(z.string()), configured: z.array(z.string()) }),
  }),
  custom_domain: z.object({
    enabled: z.boolean(),
    included_in_plan: z.boolean(),
    addon_price_yearly: amount.nullable(),
    addon_expires_at: z.string().nullable(),
  }),
  plans: z.array(planOptionSchema.extend({ is_current: z.boolean(), is_upgrade: z.boolean(), contact_whatsapp_url: z.string().nullable() })),
  renew_whatsapp_url: z.string().nullable(),
  history: z.array(historyRowSchema), // newest first
});
export const planEnvelopeSchema = z.object({ data: planSchema });
export type PlanData = z.infer<typeof planSchema>;

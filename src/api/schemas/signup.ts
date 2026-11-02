import { z } from 'zod';

// Money-ish fields are accepted as string or number: the contract doesn't pin
// the wire type for signup/options. They are only ever displayed, via String().
const amount = z.union([z.string(), z.number()]);

export const planSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    blurb: z.string().nullable().optional(),
    price_yearly: amount,
    price_monthly_quote: amount,
    staff_accounts: z.number().nullable(),
    custom_domain_included: z.boolean(),
    courier_drivers: z.unknown().optional(),
  })
  .passthrough();

export const categorySchema = z
  .object({ key: z.string(), label: z.string(), starting_theme: z.string().nullable().optional() })
  .passthrough();

export const signupOptionsSchema = z.object({
  plans: z.array(planSchema),
  custom_domain_addon_price: amount.nullable().optional(),
  categories: z.array(categorySchema),
});

export const subdomainAvailabilitySchema = z.object({
  available: z.boolean(),
  message: z.string().nullable().optional(),
});

export type SignupOptions = z.infer<typeof signupOptionsSchema>;
export type SignupPlan = z.infer<typeof planSchema>;

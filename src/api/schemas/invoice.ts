import { z } from 'zod';

export const invoiceSchema = z.object({
  invoice_number: z.string(),
  date: z.string(),
  store: z.object({
    name: z.string(),
    whatsapp_number: z.string().nullable(),
    logo_url: z.string().nullable(),
  }),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string().nullable(),
  }),
  payment: z.object({ method: z.string(), method_label: z.string(), status: z.string() }),
  items: z.array(
    z.object({
      description: z.string(),
      sku: z.string().nullable(),
      unit_price: z.string(),
      quantity: z.number(),
      line_total: z.string(),
    }),
  ),
  totals: z.object({
    subtotal: z.string(),
    discount: z.string(),
    coupon_code: z.string().nullable(),
    delivery_charge: z.string(),
    total: z.string(),
    advance_paid: z.string(),
    amount_due: z.string(),
  }),
});

export const invoiceEnvelopeSchema = z.object({ data: invoiceSchema });
export type Invoice = z.infer<typeof invoiceSchema>;

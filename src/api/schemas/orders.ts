import { z } from 'zod';

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
export const orderStatusSchema = z.enum(ORDER_STATUSES);
export const paymentStatusSchema = z.enum(['unpaid', 'paid', 'failed']);
export const paymentMethodSchema = z.enum(['cod', 'sslcommerz', 'manual_bkash', 'manual_nagad', 'pos']);

export const orderRowSchema = z.object({
  id: z.number(),
  order_number: z.string(),
  status: orderStatusSchema,
  payment_method: paymentMethodSchema,
  payment_status: paymentStatusSchema,
  customer_name: z.string(),
  customer_phone: z.string(),
  total: z.string(),
  created_at: z.string(),
});

export const orderItemSchema = z.object({
  id: z.number(),
  product_id: z.number().nullable(),
  variant_id: z.number().nullable(),
  product_name: z.string(),
  variant_name: z.string().nullable(),
  sku: z.string().nullable(),
  unit_price: z.string(),
  quantity: z.number(),
  line_total: z.string(),
});

export const customerRiskSchema = z.object({
  total: z.number(),
  delivered: z.number(),
  cancelled: z.number(),
  resolved: z.number().optional(),
  cancellation_rate: z.union([z.number(), z.string()]).nullable(),
  level: z.enum(['new', 'low', 'medium', 'high']),
});

export const paymentRecordSchema = z.object({
  id: z.number(),
  method: z.string(),
  status: z.string(), // pending | paid | failed
  amount: z.string(),
  reference_number: z.string().nullable(),
  paid_at: z.string().nullable(),
});

export const courierBookingSchema = z.object({
  driver: z.string(),
  consignment_id: z.string().nullable(),
  tracking_code: z.string().nullable(),
  status: z.string(), // free-form from the courier; shown as-is
  booked_at: z.string().nullable(),
});

export const orderDetailSchema = orderRowSchema.extend({
  customer_address: z.string().nullable(),
  delivery_zone: z.string().nullable(),
  coupon_code: z.string().nullable(),
  subtotal: z.string(),
  discount_amount: z.string(),
  delivery_charge: z.string(),
  advance_paid: z.string(),
  amount_due: z.string(),
  cancelled_at: z.string().nullable(),
  items: z.array(orderItemSchema),
  payment: paymentRecordSchema.nullable(),
  advance_payments: z.array(paymentRecordSchema),
  courier: z.object({
    booking: courierBookingSchema.nullable(),
    available_drivers: z.array(z.string()),
  }),
  customer_risk: customerRiskSchema,
});

export const ordersPageSchema = z.object({
  data: z.array(orderRowSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).passthrough(),
});

export const orderEnvelopeSchema = z.object({ data: orderDetailSchema });

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderRow = z.infer<typeof orderRowSchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;

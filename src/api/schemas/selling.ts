import { z } from 'zod';
import { imageSchema } from './catalogue';
import { customerRiskSchema, orderEnvelopeSchema, orderRowSchema } from './orders';

const pageMeta = z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).passthrough();

/* ---------- POS ---------- */
export const posProductSchema = z.object({
  variant_id: z.number(),
  product_id: z.number(),
  product_name: z.string(),
  variant_name: z.string().nullable(),
  sku: z.string(),
  price: z.string(),
  stock_quantity: z.number(),
  tracks_inventory: z.boolean(),
  thumb: z.string().nullable(),
  price_tiers: z.array(z.object({ min_quantity: z.number(), price: z.string() })),
});
export const posProductsSchema = z.object({ data: z.array(posProductSchema) });
/** A sale returns the full order (payment_method "pos", status "delivered"). */
export const posSaleSchema = orderEnvelopeSchema;
export type PosProduct = z.infer<typeof posProductSchema>;

/* ---------- Coupons ---------- */
export const COUPON_TYPES = ['percentage', 'fixed', 'free_delivery'] as const;
export const couponSchema = z.object({
  id: z.number(),
  code: z.string(),
  type: z.enum(COUPON_TYPES),
  value: z.string().nullable(),
  min_order_amount: z.string().nullable(),
  max_uses: z.number().nullable(),
  used_count: z.number(),
  starts_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  is_active: z.boolean(),
});
export const couponsPageSchema = z.object({ data: z.array(couponSchema), meta: pageMeta });
export const couponEnvelopeSchema = z.object({ data: couponSchema });
export type Coupon = z.infer<typeof couponSchema>;

/* ---------- Delivery zones ---------- */
export const deliveryZoneSchema = z.object({
  zone: z.string(), // inside_dhaka | outside_dhaka
  base_charge: z.string(),
  base_weight_grams: z.number(),
  per_kg_charge: z.string(),
  estimated_delivery_note: z.string().nullable(),
});
export const deliveryZonesSchema = z.object({ data: z.array(deliveryZoneSchema) });
export const deliveryZoneEnvelopeSchema = z.object({ data: deliveryZoneSchema });
export type DeliveryZone = z.infer<typeof deliveryZoneSchema>;

/* ---------- Landing pages ---------- */
export const testimonialSchema = z.object({ id: z.number(), author_name: z.string(), quote: z.string() });
const landingProduct = z.object({ id: z.number(), name: z.string() }).nullable();

export const landingPageRowSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  is_active: z.boolean(),
  product: landingProduct,
  url: z.string(),
});
export const landingPageDetailSchema = landingPageRowSchema.extend({
  headline: z.string(),
  subheadline: z.string().nullable(),
  description: z.string().nullable(),
  why_choose_us: z.string().nullable(),
  images: z.array(imageSchema),
  testimonials: z.array(testimonialSchema),
});
export const landingPagesPageSchema = z.object({ data: z.array(landingPageRowSchema), meta: pageMeta });
export const landingPageEnvelopeSchema = z.object({ data: landingPageDetailSchema });
export const testimonialEnvelopeSchema = z.object({ data: testimonialSchema });
export const landingImageEnvelopeSchema = z.object({ data: imageSchema });
export type LandingPageDetail = z.infer<typeof landingPageDetailSchema>;
export type LandingPageRow = z.infer<typeof landingPageRowSchema>;

/* ---------- Abandoned carts ---------- */
export const abandonedCartSchema = z.object({
  id: z.number(),
  phone: z.string(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  last_activity_at: z.string(),
  total: z.string(),
  items: z.array(
    z.object({
      product_name: z.string(),
      variant_name: z.string().nullable(),
      sku: z.string().nullable(),
      quantity: z.number(),
      line_total: z.string(),
    }),
  ),
});
export const abandonedCartsPageSchema = z.object({ data: z.array(abandonedCartSchema), meta: pageMeta });
export type AbandonedCart = z.infer<typeof abandonedCartSchema>;

/* ---------- Reviews (moderation only) ---------- */
export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export const reviewSchema = z.object({
  id: z.number(),
  product: landingProduct,
  customer_name: z.string(),
  customer_phone: z.string().nullable(),
  rating: z.number(),
  comment: z.string().nullable(),
  status: z.enum(REVIEW_STATUSES),
  is_verified_buyer: z.boolean(),
  created_at: z.string(),
  moderated_at: z.string().nullable(),
});
export const reviewsPageSchema = z.object({
  reviews_enabled: z.boolean(),
  counts: z.object({ pending: z.number(), approved: z.number(), rejected: z.number() }),
  data: z.array(reviewSchema),
  meta: pageMeta,
});
export const reviewEnvelopeSchema = z.object({ data: reviewSchema });
export type Review = z.infer<typeof reviewSchema>;

/* ---------- Customers ---------- */
export const customerRowSchema = z.object({
  phone: z.string(),
  name: z.string(),
  orders_count: z.number(),
  delivered_count: z.number(),
  cancelled_count: z.number(),
  total_spent: z.string(),
  last_order_at: z.string().nullable(),
  risk_level: z.enum(['new', 'low', 'medium', 'high']),
});
export const customersPageSchema = z.object({ data: z.array(customerRowSchema), meta: pageMeta });
export const customerDetailSchema = z.object({
  phone: z.string(),
  name: z.string(),
  last_address: z.string().nullable(),
  orders_count: z.number(),
  total_spent: z.string(),
  has_account: z.boolean(),
  risk: customerRiskSchema,
  orders: z.array(orderRowSchema),
});
export const customerEnvelopeSchema = z.object({ data: customerDetailSchema });
export type CustomerRow = z.infer<typeof customerRowSchema>;
export type CustomerDetail = z.infer<typeof customerDetailSchema>;

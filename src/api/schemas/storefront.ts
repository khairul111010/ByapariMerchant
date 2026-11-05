import { z } from 'zod';
import { orderRowSchema } from './orders';

/* ---------- Banners ---------- */
export const bannerSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  link_url: z.string().nullable(),
  position: z.number(),
  is_active: z.boolean(),
  image: z.string(),
});
export const bannersSchema = z.object({ data: z.array(bannerSchema) });
export const bannerEnvelopeSchema = z.object({ data: bannerSchema });
export type Banner = z.infer<typeof bannerSchema>;

/* ---------- Home sections ---------- */
export const SECTION_SOURCES = ['manual', 'featured', 'category', 'newest', 'best_sellers', 'on_sale'] as const;

const pickProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  is_featured: z.boolean(),
  track_inventory: z.boolean(),
  brand: z.string().nullable(),
  thumb: z.string().nullable(),
  default_variant: z
    .object({ id: z.number(), sku: z.string(), price: z.string(), compare_at_price: z.string().nullable(), stock_quantity: z.number() })
    .nullable(),
  created_at: z.string(),
});

export const homeSectionSchema = z.object({
  id: z.number(),
  title: z.string(),
  title_bn: z.string().nullable(),
  subtitle: z.string().nullable(),
  source: z.string(),
  source_label: z.string(),
  category: z.object({ id: z.number(), name: z.string() }).nullable(),
  product_limit: z.number(),
  is_active: z.boolean(),
  position: z.number(),
  picks_count: z.number(),
});
export const homeSectionDetailSchema = homeSectionSchema.extend({
  picks: z.array(z.object({ id: z.number(), position: z.number(), product: pickProductSchema })),
});
export const homeSectionsSchema = z.object({
  data: z.array(homeSectionSchema),
  limits: z.object({ max_visible: z.number(), max_picks: z.number() }),
  sources: z.array(z.object({ key: z.string(), label: z.string() })),
  featured_products_count: z.number(),
});
export const homeSectionEnvelopeSchema = z.object({ data: homeSectionSchema });
export const homeSectionDetailEnvelopeSchema = z.object({ data: homeSectionDetailSchema });
export const sectionPreviewSchema = z.object({ data: z.array(pickProductSchema) });
export type HomeSection = z.infer<typeof homeSectionSchema>;
export type HomeSectionDetail = z.infer<typeof homeSectionDetailSchema>;

/* ---------- Theme and appearance (owner only) ---------- */
export const themeSchema = z.object({
  slug: z.string(),
  label: z.string(),
  blurb: z.string(),
  family: z.string(),
  is_current: z.boolean(),
  is_category_default: z.boolean(),
  preview: z.object({ header: z.string(), headerText: z.string(), accent: z.string(), tiles: z.array(z.string()) }),
});
export const themesSchema = z.object({ data: z.array(themeSchema) });
export const appearanceSchema = z.object({
  theme: z.string().nullable(), // null = the category default
  effective_theme: z.string(),
  theme_accent_color: z.string().nullable(),
  show_category_tiles: z.boolean(),
  show_theme_highlight_section: z.boolean(),
  logo_url: z.string().nullable(),
});
export const appearanceEnvelopeSchema = z.object({ data: appearanceSchema });
export type Theme = z.infer<typeof themeSchema>;
export type Appearance = z.infer<typeof appearanceSchema>;

/* ---------- Dashboard ---------- */
export const dashboardSchema = z.object({
  period: z.object({ range: z.number().nullable(), from: z.string(), to: z.string() }),
  revenue: z.string(),
  revenue_delta_percent: z.number().nullable(),
  orders_count: z.number(),
  orders_delta_percent: z.number().nullable(),
  average_order_value: z.string(),
  conversion_rate: z.number().nullable(),
  funnel: z.object({
    product_view: z.number(),
    form_engaged: z.number(),
    add_to_cart: z.number(),
    checkout_start: z.number(),
    checkout_complete: z.number(),
  }),
  funnel_rates: z.object({
    form_engaged: z.number().nullable(),
    add_to_cart: z.number().nullable(),
    checkout_start: z.number().nullable(),
    checkout_completion: z.number().nullable(),
  }),
  orders_by_status: z.record(z.string(), z.number()),
  daily: z.array(z.object({ date: z.string(), orders: z.number(), revenue: z.string() })),
  top_products: z.array(z.object({ product_id: z.number(), name: z.string(), units: z.number(), revenue: z.string() })),
  recent_orders: z.array(orderRowSchema),
  pending_payments: z.number(),
  // The row shape is not in the samples (always empty there), so it stays opaque until one exists.
  low_stock: z.array(z.unknown()),
  checklist: z.array(z.object({ key: z.string(), done: z.boolean() })),
});
export const dashboardEnvelopeSchema = z.object({ data: dashboardSchema });
export type Dashboard = z.infer<typeof dashboardSchema>;

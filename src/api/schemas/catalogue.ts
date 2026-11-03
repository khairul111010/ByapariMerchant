import { z } from 'zod';

export const PRODUCT_STATUSES = ['draft', 'active', 'archived'] as const;
export const productStatusSchema = z.enum(PRODUCT_STATUSES);

export const imageSchema = z.object({
  id: z.number(),
  thumb: z.string(),
  card: z.string(),
  zoom: z.string(),
  position: z.number(),
});

export const priceTierSchema = z.object({
  id: z.number(),
  min_quantity: z.number(),
  price: z.string(),
});

export const variantSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  sku: z.string(),
  name: z.string().nullable(),
  attributes: z.unknown().nullable(),
  price: z.string(),
  compare_at_price: z.string().nullable(),
  stock_quantity: z.number(),
  low_stock_threshold: z.number().nullable(),
  weight_grams: z.number().nullable(),
  is_default: z.boolean(),
  images: z.array(imageSchema),
  // Absent on the lookup response.
  price_tiers: z.array(priceTierSchema).optional(),
});

const defaultVariantSchema = z.object({
  id: z.number(),
  sku: z.string(),
  price: z.string(),
  compare_at_price: z.string().nullable(),
  stock_quantity: z.number(),
});

export const productRowSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  status: productStatusSchema,
  is_featured: z.boolean(),
  track_inventory: z.boolean(),
  brand: z.string().nullable(),
  category: z.object({ id: z.number(), name: z.string() }).nullable(),
  thumb: z.string().nullable(),
  default_variant: defaultVariantSchema.nullable(),
  created_at: z.string(),
});

export const productDetailSchema = productRowSchema.extend({
  description: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  storefront_url: z.string(),
  images: z.array(imageSchema),
  variants: z.array(variantSchema),
});

export const productsPageSchema = z.object({
  data: z.array(productRowSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).passthrough(),
});

export const productEnvelopeSchema = z.object({ data: productDetailSchema });
export const variantEnvelopeSchema = z.object({ data: variantSchema });

export const categorySchema = z.object({
  id: z.number(),
  parent_id: z.number().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  position: z.number(),
  is_active: z.boolean(),
  image: z.string().nullable(),
  products_count: z.number(),
});
export const categoriesSchema = z.object({ data: z.array(categorySchema) });

export const stockHistorySchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      delta: z.number(),
      balance_after: z.number(),
      reason: z.string(),
      reason_label: z.string(),
      note: z.string().nullable(),
      order: z.unknown().nullable(),
      user: z.string().nullable(),
      created_at: z.string(),
    }),
  ),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }),
});

export const lowStockSchema = z.object({
  data: z.array(
    z.object({
      variant_id: z.number(),
      product_id: z.number(),
      product_name: z.string(),
      variant_name: z.string().nullable(),
      sku: z.string(),
      stock_quantity: z.number(),
      low_stock_threshold: z.number().nullable(),
    }),
  ),
});

export const lookupSchema = z.object({
  variant: variantSchema,
  product: z.object({ id: z.number(), name: z.string(), status: z.string() }),
});

export const importSchema = z.object({
  id: z.number(),
  original_filename: z.string(),
  status: z.string(), // pending | processing | completed | completed_with_errors | failed
  total_rows: z.number().nullable(),
  processed_rows: z.number().nullable(),
  imported_count: z.number().nullable(),
  failed_count: z.number().nullable(),
  errors: z.array(z.object({ row: z.number(), sku: z.string(), message: z.string() })).nullable(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  created_at: z.string(),
});
export const importEnvelopeSchema = z.object({ data: importSchema });
export const importsSchema = z.object({ data: z.array(importSchema) });

export const describeSchema = z.object({ description: z.string() });

export type ProductRow = z.infer<typeof productRowSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type Category = z.infer<typeof categorySchema>;

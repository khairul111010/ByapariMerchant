import { z } from 'zod';
import { api } from '../../api/instance';
import {
  categoriesSchema,
  imageSchema,
  lookupSchema,
  lowStockSchema,
  stockHistorySchema,
  productEnvelopeSchema,
  productsPageSchema,
  ProductStatus,
  variantEnvelopeSchema,
} from '../../api/schemas/catalogue';

export interface ProductFilters {
  status?: ProductStatus;
  q?: string;
  low_stock?: boolean;
  category_id?: number;
}

export const fetchProducts = (f: ProductFilters, page: number) =>
  api.get('/products', {
    query: { status: f.status, q: f.q, low_stock: f.low_stock ? 1 : undefined, category_id: f.category_id, page, per_page: 20 },
    schema: productsPageSchema,
  });

export const fetchProduct = (id: number) =>
  api.get(`/products/${id}`, { schema: productEnvelopeSchema }).then((r) => r.data);

export const fetchCategories = () => api.get('/categories', { schema: categoriesSchema }).then((r) => r.data);

/** Atomic and safe with two phones. Not idempotent, so never queued: send once, then re-read. */
export const adjustStockDelta = (productId: number, variantId: number, quantity: number, note?: string) =>
  api
    .post(`/products/${productId}/variants/${variantId}/stock`, {
      body: { mode: 'delta', quantity, note },
      schema: variantEnvelopeSchema,
    })
    .then((r) => r.data);

const imageEnvelope = z.object({ data: imageSchema });

export function uploadProductImage(
  productId: number,
  file: { uri: string; name: string; type: string },
  onProgress?: (fraction: number) => void,
) {
  const form = new FormData();
  // React Native's FormData accepts {uri,name,type} for files.
  form.append('image', file as unknown as Blob);
  return api.upload(`/products/${productId}/images`, form, { schema: imageEnvelope, onProgress }).then((r) => r.data);
}

/** Must list every image exactly once; the first is the main image. */
export const reorderProductImages = (productId: number, ids: number[]) =>
  api.put(`/products/${productId}/images/order`, { body: { ids }, schema: z.unknown() });

export const deleteProductImage = (productId: number, mediaId: number) =>
  api.delete(`/products/${productId}/images/${mediaId}`, { schema: z.unknown() });

/** Stock-take: sends `expected` so a count that moved meanwhile returns 409 stock_changed. */
export const setStock = (productId: number, variantId: number, quantity: number, expected: number, note?: string) =>
  api
    .post(`/products/${productId}/variants/${variantId}/stock`, {
      body: { mode: 'set', quantity, expected, note },
      schema: variantEnvelopeSchema,
    })
    .then((r) => r.data);

export const fetchStockHistory = (productId: number, variantId: number) =>
  api.get(`/products/${productId}/variants/${variantId}/stock-history`, { schema: stockHistorySchema });

export const fetchLowStock = () => api.get('/inventory/low-stock', { schema: lowStockSchema }).then((r) => r.data);

/** A scan is an exact SKU lookup; the server answers 404 sku_not_found for unknown codes. */
export const lookupSku = (sku: string) => api.get('/variants/lookup', { query: { sku }, schema: lookupSchema });

export const createProduct = (body: Record<string, unknown>) =>
  api.post('/products', { body, schema: productEnvelopeSchema }).then((r) => r.data);

// The update response shape is not in the samples, so the caller re-reads the product afterwards.
export const updateProduct = (id: number, body: Record<string, unknown>) =>
  api.put(`/products/${id}`, { body, schema: z.unknown() });

export const createVariant = (productId: number, body: Record<string, unknown>) =>
  api.post(`/products/${productId}/variants`, { body, schema: variantEnvelopeSchema }).then((r) => r.data);

export const updateVariant = (productId: number, variantId: number, body: Record<string, unknown>) =>
  api.put(`/products/${productId}/variants/${variantId}`, { body, schema: variantEnvelopeSchema }).then((r) => r.data);

export const deleteVariant = (productId: number, variantId: number) =>
  api.delete(`/products/${productId}/variants/${variantId}`, { schema: z.unknown() });

export const deleteProduct = (id: number) => api.delete(`/products/${id}`, { schema: z.unknown() });

import { api } from '../../api/instance';
import { posProductsSchema, posSaleSchema } from '../../api/schemas/selling';

/** Active-product variants matching name or SKU (up to 20). A barcode scan is just `q=<sku>`. */
export const searchPos = (q: string) => api.get('/pos/products', { query: { q }, schema: posProductsSchema }).then((r) => r.data);

export interface SaleInput {
  items: Array<{ variant_id: number; quantity: number }>;
  customer_name?: string;
  customer_phone?: string;
}

/** Cash sale only: no discount, no delivery charge, no payment choice (parity with the web POS). */
export const createSale = (body: SaleInput) => api.post('/pos/sales', { body, schema: posSaleSchema }).then((r) => r.data);

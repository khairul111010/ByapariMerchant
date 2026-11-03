import type { TFunction } from 'i18next';
import { z } from 'zod';
import { PRODUCT_STATUSES, Variant } from '../../api/schemas/catalogue';

/** Money stays a string end to end: "1500", "1500.5" or "1500.50". */
export const MONEY = /^\d+(\.\d{1,2})?$/;
const WHOLE = /^\d+$/;

const money = (t: TFunction) => z.string().trim().regex(MONEY, t('products.form.invalidAmount'));
const optionalMoney = (t: TFunction) => z.string().trim().refine((v) => v === '' || MONEY.test(v), t('products.form.invalidAmount'));
const whole = (t: TFunction) => z.string().trim().regex(WHOLE, t('products.form.invalidNumber'));

export const makeCreateSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(1, t('products.form.nameRequired')),
    status: z.enum(PRODUCT_STATUSES),
    sku: z.string().trim().min(1, t('products.form.skuRequired')),
    price: money(t),
    compare_at_price: optionalMoney(t),
    stock_quantity: whole(t),
    category_id: z.number().nullable(),
    brand: z.string().trim(),
    track_inventory: z.boolean(),
    is_featured: z.boolean(),
  });

export const makeEditSchema = (t: TFunction) =>
  makeCreateSchema(t).omit({ sku: true, price: true, compare_at_price: true, stock_quantity: true });

export type CreateForm = z.infer<ReturnType<typeof makeCreateSchema>>;
export type EditForm = z.infer<ReturnType<typeof makeEditSchema>>;

export function toCreatePayload(v: CreateForm, descriptionHtml: string) {
  return {
    name: v.name.trim(),
    status: v.status,
    sku: v.sku.trim(),
    price: v.price.trim(),
    compare_at_price: v.compare_at_price.trim() || undefined,
    stock_quantity: Number(v.stock_quantity),
    category_id: v.category_id ?? undefined,
    brand: v.brand.trim() || undefined,
    track_inventory: v.track_inventory,
    is_featured: v.is_featured,
    description: descriptionHtml || undefined,
  };
}

/** Products need the same required fields on update as on create (not a partial update). */
export function toUpdatePayload(v: EditForm, descriptionHtml: string) {
  return {
    name: v.name.trim(),
    status: v.status,
    category_id: v.category_id,
    brand: v.brand.trim() || null,
    track_inventory: v.track_inventory,
    is_featured: v.is_featured,
    description: descriptionHtml || null,
  };
}

export const makeVariantSchema = (t: TFunction) =>
  z.object({
    sku: z.string().trim().min(1, t('products.form.skuRequired')),
    name: z.string().trim(),
    price: money(t),
    compare_at_price: optionalMoney(t),
    low_stock_threshold: z.string().trim().refine((x) => x === '' || WHOLE.test(x), t('products.form.invalidNumber')),
  });

export const makeNewVariantSchema = (t: TFunction) =>
  makeVariantSchema(t).extend({ stock_quantity: whole(t) });

export type VariantForm = z.infer<ReturnType<typeof makeVariantSchema>>;
export type NewVariantForm = z.infer<ReturnType<typeof makeNewVariantSchema>>;

/**
 * Editing a variant never changes stock here: it sends the count the screen showed as both the
 * new value and `stock_quantity_was`, so sales that landed meanwhile are never overwritten.
 */
export function toVariantUpdatePayload(v: VariantForm, current: Pick<Variant, 'stock_quantity'>) {
  return {
    sku: v.sku.trim(),
    name: v.name.trim() || null,
    price: v.price.trim(),
    compare_at_price: v.compare_at_price.trim() || null,
    low_stock_threshold: v.low_stock_threshold.trim() === '' ? null : Number(v.low_stock_threshold),
    stock_quantity: current.stock_quantity,
    stock_quantity_was: current.stock_quantity,
  };
}

export function toNewVariantPayload(v: NewVariantForm) {
  return {
    sku: v.sku.trim(),
    name: v.name.trim() || undefined,
    price: v.price.trim(),
    compare_at_price: v.compare_at_price.trim() || undefined,
    low_stock_threshold: v.low_stock_threshold.trim() === '' ? undefined : Number(v.low_stock_threshold),
    stock_quantity: Number(v.stock_quantity),
  };
}

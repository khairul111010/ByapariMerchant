import type { TFunction } from 'i18next';
import { z } from 'zod';

const MONEY = /^\d+(\.\d{1,2})?$/;
const WHOLE = /^\d+$/;

/** Zones cannot be added or removed; every field but the note is required on each save. */
export const makeZoneSchema = (t: TFunction) =>
  z.object({
    base_charge: z
      .string()
      .trim()
      .regex(MONEY, t('products.form.invalidAmount')),
    base_weight_grams: z
      .string()
      .trim()
      .regex(WHOLE, t('products.form.invalidNumber')),
    per_kg_charge: z
      .string()
      .trim()
      .regex(MONEY, t('products.form.invalidAmount')),
    estimated_delivery_note: z.string().trim(),
  });

export type ZoneForm = z.infer<ReturnType<typeof makeZoneSchema>>;

export const toZonePayload = (v: ZoneForm) => ({
  base_charge: v.base_charge.trim(),
  base_weight_grams: Number(v.base_weight_grams),
  per_kg_charge: v.per_kg_charge.trim(),
  estimated_delivery_note: v.estimated_delivery_note.trim() || null,
});

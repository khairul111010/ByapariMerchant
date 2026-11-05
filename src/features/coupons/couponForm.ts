import type { TFunction } from 'i18next';
import { z } from 'zod';
import { COUPON_TYPES } from '../../api/schemas/selling';

const MONEY = /^\d+(\.\d{1,2})?$/;
const WHOLE = /^\d+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-12-31T00:00:00+00:00" -> "2026-12-31" for the date field. */
export const isoToDateInput = (iso: string | null | undefined): string =>
  iso ? iso.slice(0, 10) : '';

const validDate = (v: string): boolean => {
  if (!DATE.test(v)) {
    return false;
  }
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

/** Courtesy checks only; the server is authoritative (it also enforces unique codes). */
export const makeCouponSchema = (t: TFunction) =>
  z
    .object({
      code: z.string().trim().min(1, t('coupons.codeRequired')),
      type: z.enum(COUPON_TYPES),
      value: z.string().trim(),
      min_order_amount: z
        .string()
        .trim()
        .refine(
          v => v === '' || MONEY.test(v),
          t('products.form.invalidAmount'),
        ),
      max_uses: z
        .string()
        .trim()
        .refine(
          v => v === '' || WHOLE.test(v),
          t('products.form.invalidNumber'),
        ),
      starts_at: z
        .string()
        .trim()
        .refine(v => v === '' || validDate(v), t('coupons.dateInvalid')),
      expires_at: z
        .string()
        .trim()
        .refine(v => v === '' || validDate(v), t('coupons.dateInvalid')),
      is_active: z.boolean(),
    })
    .superRefine((v, ctx) => {
      if (v.type === 'free_delivery') {
        return;
      }
      if (!MONEY.test(v.value)) {
        ctx.addIssue({
          code: 'custom',
          path: ['value'],
          message: t('coupons.valueRequired'),
        });
      } else if (v.type === 'percentage' && Number(v.value) > 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['value'],
          message: t('coupons.percentMax'),
        });
      }
    })
    .refine(
      v =>
        v.starts_at === '' ||
        v.expires_at === '' ||
        v.starts_at <= v.expires_at,
      {
        path: ['expires_at'],
        message: t('coupons.dateOrder'),
      },
    );

export type CouponForm = z.infer<ReturnType<typeof makeCouponSchema>>;

/** Coupons need the same fields on update as on create. A free-delivery coupon carries no value. */
export function toCouponPayload(v: CouponForm) {
  return {
    code: v.code.trim().toUpperCase(),
    type: v.type,
    value: v.type === 'free_delivery' ? null : v.value.trim(),
    min_order_amount: v.min_order_amount.trim() || null,
    max_uses: v.max_uses.trim() === '' ? null : Number(v.max_uses),
    starts_at: v.starts_at.trim() || null,
    expires_at: v.expires_at.trim() || null,
    is_active: v.is_active,
  };
}

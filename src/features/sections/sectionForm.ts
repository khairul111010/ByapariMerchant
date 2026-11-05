import type { TFunction } from 'i18next';
import { z } from 'zod';
import { SECTION_SOURCES } from '../../api/schemas/storefront';

export const MIN_LIMIT = 4;
export const MAX_LIMIT = 12;

/** Needs the same fields on update as on create. `category_id` only matters for the category source. */
export const makeSectionSchema = (t: TFunction) =>
  z
    .object({
      title: z.string().trim().min(1, t('sections.titleRequired')),
      title_bn: z.string().trim(),
      subtitle: z.string().trim(),
      source: z.enum(SECTION_SOURCES),
      category_id: z.number().nullable(),
      product_limit: z
        .string()
        .trim()
        .regex(/^\d+$/, t('products.form.invalidNumber')),
      is_active: z.boolean(),
    })
    .superRefine((v, ctx) => {
      if (v.source === 'category' && v.category_id === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['category_id'],
          message: t('sections.categoryRequired'),
        });
      }
      const n = Number(v.product_limit);
      if (/^\d+$/.test(v.product_limit) && (n < MIN_LIMIT || n > MAX_LIMIT)) {
        ctx.addIssue({
          code: 'custom',
          path: ['product_limit'],
          message: t('sections.limitRange', { min: MIN_LIMIT, max: MAX_LIMIT }),
        });
      }
    });

export type SectionForm = z.infer<ReturnType<typeof makeSectionSchema>>;

export function toSectionPayload(v: SectionForm) {
  return {
    title: v.title.trim(),
    title_bn: v.title_bn.trim() || null,
    subtitle: v.subtitle.trim() || null,
    source: v.source,
    // The server wants a category only for the category source; sending one otherwise would be noise.
    category_id: v.source === 'category' ? v.category_id : null,
    product_limit: Number(v.product_limit),
    is_active: v.is_active,
  };
}

import type { TFunction } from 'i18next';
import { z } from 'zod';

export const makeLandingSchema = (t: TFunction) =>
  z.object({
    title: z.string().trim().min(1, t('landing.titleRequired')),
    headline: z.string().trim().min(1, t('landing.headlineRequired')),
    subheadline: z.string().trim(),
    description: z.string().trim(),
    why_choose_us: z.string(),
    is_active: z.boolean(),
  });

export type LandingForm = z.infer<ReturnType<typeof makeLandingSchema>>;

/** "One bullet per line": drop blanks and trim each line. */
export const normalizeBullets = (text: string): string =>
  text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n');

/**
 * Landing pages need product_id, title and headline on every save (create and update), and the
 * multipart body is always POSTed. Empty optional strings clear the field.
 */
export function landingFields(
  v: LandingForm,
  productId: number,
): Record<string, string> {
  return {
    product_id: String(productId),
    title: v.title.trim(),
    headline: v.headline.trim(),
    subheadline: v.subheadline.trim(),
    description: v.description.trim(),
    why_choose_us: normalizeBullets(v.why_choose_us),
    is_active: v.is_active ? '1' : '0',
  };
}

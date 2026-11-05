import { z } from 'zod';
import { api } from '../../api/instance';
import {
  appearanceEnvelopeSchema,
  themesSchema,
} from '../../api/schemas/storefront';
import type { PreparedImage } from '../../media/prepare';

export const fetchThemes = () =>
  api.get('/storefront/themes', { schema: themesSchema }).then(r => r.data);
export const fetchAppearance = () =>
  api
    .get('/storefront/appearance', { schema: appearanceEnvelopeSchema })
    .then(r => r.data);

export interface AppearancePatch {
  theme?: string | null; // null resets to the category default
  theme_accent_color?: string | null; // "#RRGGBB", or null to reset
  show_category_tiles?: boolean;
  show_theme_highlight_section?: boolean;
}

/** Partial: only the keys sent change. Owner only (staff get 403). */
export const updateAppearance = (patch: AppearancePatch) =>
  api
    .put('/storefront/appearance', {
      body: patch,
      schema: appearanceEnvelopeSchema,
    })
    .then(r => r.data);

/** Field `logo`: jpeg, png, webp or svg, at most 2 MB. */
export function uploadLogo(
  image: PreparedImage,
  onProgress?: (f: number) => void,
) {
  const form = new FormData();
  form.append('logo', {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as unknown as Blob);
  return api
    .upload('/storefront/logo', form, {
      schema: appearanceEnvelopeSchema,
      onProgress,
    })
    .then(r => r.data);
}
export const deleteLogo = () =>
  api.delete('/storefront/logo', { schema: z.unknown() });

import { z } from 'zod';
import { api } from '../../api/instance';
import {
  categoryEnvelopeSchema,
  messageSchema,
} from '../../api/schemas/catalogue';
import type { PreparedImage } from '../../media/prepare';

export interface CategoryValues {
  name: string;
  parentId: number | null;
  description: string;
  isActive: boolean;
}

/**
 * Categories need their required fields on every save (same as create), and the
 * multipart body is always sent with POST. Empty strings clear optional fields.
 */
export function categoryFields(
  v: CategoryValues,
  removeImage: boolean,
): Record<string, string> {
  const f: Record<string, string> = {
    name: v.name.trim(),
    parent_id: v.parentId === null ? '' : String(v.parentId),
    description: v.description.trim(),
    is_active: v.isActive ? '1' : '0',
  };
  if (removeImage) {
    f.remove_image = '1';
  }
  return f;
}

export function saveCategory(
  id: number | null,
  values: CategoryValues,
  opts: {
    image?: PreparedImage;
    removeImage?: boolean;
    onProgress?: (f: number) => void;
  },
) {
  const form = new FormData();
  for (const [k, val] of Object.entries(
    categoryFields(values, !!opts.removeImage && !opts.image),
  )) {
    form.append(k, val);
  }
  if (opts.image) {
    form.append('image', {
      uri: opts.image.uri,
      name: opts.image.name,
      type: opts.image.type,
    } as unknown as Blob);
  }
  return api.upload(id === null ? '/categories' : `/categories/${id}`, form, {
    schema: categoryEnvelopeSchema,
    onProgress: opts.onProgress,
  });
}

/** Full new order of every category. */
export const reorderCategories = (ids: number[]) =>
  api.put('/categories/reorder', { body: { ids }, schema: z.unknown() });

export const deleteCategory = (id: number) =>
  api.delete(`/categories/${id}`, { schema: messageSchema });

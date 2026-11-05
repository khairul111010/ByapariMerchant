import { z } from 'zod';
import { api } from '../../api/instance';
import {
  bannerEnvelopeSchema,
  bannersSchema,
} from '../../api/schemas/storefront';
import type { PreparedImage } from '../../media/prepare';

export const fetchBanners = () =>
  api.get('/banners', { schema: bannersSchema }).then(r => r.data);

export interface BannerValues {
  title: string;
  linkUrl: string;
  isActive: boolean;
}

/** Create needs an image. Update is a partial multipart POST: only keys sent change; an image replaces the old one. */
export function saveBanner(
  id: number | null,
  v: BannerValues,
  image: PreparedImage | null,
  onProgress?: (f: number) => void,
) {
  const form = new FormData();
  form.append('title', v.title.trim());
  form.append('link_url', v.linkUrl.trim());
  form.append('is_active', v.isActive ? '1' : '0');
  if (image) {
    form.append('image', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
  }
  return api
    .upload(id === null ? '/banners' : `/banners/${id}`, form, {
      schema: bannerEnvelopeSchema,
      onProgress,
    })
    .then(r => r.data);
}

/** Hiding or showing sends only `is_active`, leaving everything else as it is. */
export function setBannerActive(id: number, isActive: boolean) {
  const form = new FormData();
  form.append('is_active', isActive ? '1' : '0');
  return api
    .upload(`/banners/${id}`, form, { schema: bannerEnvelopeSchema })
    .then(r => r.data);
}

export const reorderBanners = (ids: number[]) =>
  api.put('/banners/reorder', { body: { ids }, schema: z.unknown() });
export const deleteBanner = (id: number) =>
  api.delete(`/banners/${id}`, { schema: z.unknown() });

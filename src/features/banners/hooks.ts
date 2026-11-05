import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  pickImage,
  PickSource,
  prepareImage,
  PreparedImage,
} from '../../media/prepare';
import {
  BannerValues,
  deleteBanner,
  fetchBanners,
  reorderBanners,
  saveBanner,
  setBannerActive,
} from './api';

export const useBanners = () =>
  useQuery({ queryKey: ['banners'], queryFn: fetchBanners });

function useRefresh() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: ['banners'] });
}

export async function chooseBannerImage(
  source: PickSource,
): Promise<PreparedImage | null> {
  const asset = await pickImage(source);
  return asset ? prepareImage(asset) : null;
}

export function useSaveBanner(id: number | null) {
  const refresh = useRefresh();
  const [progress, setProgress] = useState<number | null>(null);
  const m = useMutation({
    mutationFn: (v: { values: BannerValues; image: PreparedImage | null }) => {
      setProgress(v.image ? 0 : null);
      return saveBanner(id, v.values, v.image, setProgress);
    },
    onSettled: () => {
      setProgress(null);
      refresh();
    },
  });
  return { ...m, progress };
}

export function useBannerActions() {
  const refresh = useRefresh();
  return {
    toggle: useMutation({
      mutationFn: (v: { id: number; active: boolean }) =>
        setBannerActive(v.id, v.active),
      onSettled: refresh,
    }),
    reorder: useMutation({
      mutationFn: (ids: number[]) => reorderBanners(ids),
      onSettled: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: number) => deleteBanner(id),
      onSettled: refresh,
    }),
  };
}

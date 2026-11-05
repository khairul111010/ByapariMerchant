import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Appearance } from '../../api/schemas/storefront';
import { LIMITS } from '../../media/fit';
import { pickImage, PickSource, prepareImage } from '../../media/prepare';
import {
  AppearancePatch,
  deleteLogo,
  fetchAppearance,
  fetchThemes,
  updateAppearance,
  uploadLogo,
} from './api';

export const useThemes = (enabled: boolean) =>
  useQuery({ queryKey: ['themes'], queryFn: fetchThemes, enabled });
export const useAppearance = (enabled: boolean) =>
  useQuery({ queryKey: ['appearance'], queryFn: fetchAppearance, enabled });

export function useAppearanceMutations() {
  const qc = useQueryClient();
  const apply = (a: Appearance) => {
    qc.setQueryData(['appearance'], a);
    void qc.invalidateQueries({ queryKey: ['themes'] }); // is_current moved
  };
  const [progress, setProgress] = useState<number | null>(null);
  return {
    progress,
    update: useMutation({
      mutationFn: (p: AppearancePatch) => updateAppearance(p),
      onSuccess: apply,
    }),
    logo: useMutation({
      mutationFn: async (source: PickSource) => {
        const asset = await pickImage(source);
        if (!asset) {
          return null;
        }
        setProgress(0);
        // The logo limit (2 MB) is smaller than the other images (5 MB).
        return uploadLogo(await prepareImage(asset, LIMITS.logo), setProgress);
      },
      onSuccess: a => a && apply(a),
      onSettled: () => setProgress(null),
    }),
    removeLogo: useMutation({
      mutationFn: () => deleteLogo(),
      onSettled: () => void qc.invalidateQueries({ queryKey: ['appearance'] }),
    }),
  };
}

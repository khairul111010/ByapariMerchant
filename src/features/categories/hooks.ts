import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pickImage,
  PickSource,
  prepareImage,
  PreparedImage,
} from '../../media/prepare';
import {
  CategoryValues,
  deleteCategory,
  reorderCategories,
  saveCategory,
} from './api';

function useRefresh() {
  const qc = useQueryClient();
  // Product rows carry category names and the counts live on categories.
  return () => {
    void qc.invalidateQueries({ queryKey: ['categories'] });
    void qc.invalidateQueries({ queryKey: ['products'] });
  };
}

export function useSaveCategory(id: number | null) {
  const refresh = useRefresh();
  const [progress, setProgress] = useState<number | null>(null);
  const m = useMutation({
    mutationFn: async (v: {
      values: CategoryValues;
      image?: PreparedImage;
      removeImage?: boolean;
    }) => {
      setProgress(v.image ? 0 : null);
      return saveCategory(id, v.values, {
        image: v.image,
        removeImage: v.removeImage,
        onProgress: setProgress,
      });
    },
    onSettled: () => {
      setProgress(null);
      refresh();
    },
  });
  return { ...m, progress };
}

/** Pick then shrink on the device; returns null if the picker was cancelled. */
export async function chooseCategoryImage(
  source: PickSource,
): Promise<PreparedImage | null> {
  const asset = await pickImage(source);
  return asset ? prepareImage(asset) : null;
}

export function useReorderCategories() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (ids: number[]) => reorderCategories(ids),
    onSettled: refresh,
  });
}

export function useDeleteCategory() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSettled: refresh,
  });
}

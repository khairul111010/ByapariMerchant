import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePagedList } from '../../api/paged';
import { pickImage, PickSource, prepareImage } from '../../media/prepare';
import {
  addTestimonial,
  deleteLandingImage,
  deleteLandingPage,
  deleteTestimonial,
  fetchLandingPage,
  fetchLandingPages,
  saveLandingPage,
  uploadLandingImage,
} from './api';

export const useLandingPages = () =>
  usePagedList(['landing'], fetchLandingPages);
export const useLandingPage = (id: number) =>
  useQuery({
    queryKey: ['landing-page', id],
    queryFn: () => fetchLandingPage(id),
  });

function useRefresh(id: number | null) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['landing'] });
    if (id !== null) {
      void qc.invalidateQueries({ queryKey: ['landing-page', id] });
    }
  };
}

export function useSaveLandingPage(id: number | null) {
  const refresh = useRefresh(id);
  return useMutation({
    mutationFn: (fields: Record<string, string>) => saveLandingPage(id, fields),
    onSettled: refresh,
  });
}

export function useDeleteLandingPage(id: number) {
  const refresh = useRefresh(id);
  return useMutation({
    mutationFn: () => deleteLandingPage(id),
    onSettled: refresh,
  });
}

export function useLandingImages(id: number) {
  const refresh = useRefresh(id);
  const [progress, setProgress] = useState<number | null>(null);
  const add = useMutation({
    mutationFn: async (source: PickSource) => {
      const asset = await pickImage(source);
      if (!asset) {
        return null;
      }
      setProgress(0);
      return uploadLandingImage(id, await prepareImage(asset), setProgress);
    },
    onSettled: () => {
      setProgress(null);
      refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (mediaId: number) => deleteLandingImage(id, mediaId),
    onSettled: refresh,
  });
  return { add, remove, progress };
}

export function useTestimonials(id: number) {
  const refresh = useRefresh(id);
  return {
    add: useMutation({
      mutationFn: (b: { author_name: string; quote: string }) =>
        addTestimonial(id, b),
      onSettled: refresh,
    }),
    remove: useMutation({
      mutationFn: (tid: number) => deleteTestimonial(id, tid),
      onSettled: refresh,
    }),
  };
}

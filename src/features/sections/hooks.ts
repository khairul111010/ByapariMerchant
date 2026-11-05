import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../store/session';
import {
  addPick,
  createSection,
  deleteSection,
  Direction,
  fetchPreview,
  fetchSection,
  fetchSections,
  movePick,
  moveSection,
  removePick,
  updateSection,
} from './api';
import { toSectionPayload } from './sectionForm';

type Body = ReturnType<typeof toSectionPayload>;

export function useSections() {
  const signedIn = useSession(s => s.status === 'signedIn');
  return useQuery({
    queryKey: ['sections'],
    queryFn: fetchSections,
    enabled: signedIn,
  });
}
export const useSection = (id: number) =>
  useQuery({ queryKey: ['section', id], queryFn: () => fetchSection(id) });
export const usePreview = (id: number) =>
  useQuery({
    queryKey: ['section-preview', id],
    queryFn: () => fetchPreview(id),
  });

function useRefresh(id: number | null) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['sections'] });
    if (id !== null) {
      void qc.invalidateQueries({ queryKey: ['section', id] });
      void qc.invalidateQueries({ queryKey: ['section-preview', id] });
    }
  };
}

export function useSectionMutations() {
  const refresh = useRefresh(null);
  return {
    create: useMutation({
      mutationFn: (b: Body) => createSection(b),
      onSettled: refresh,
    }),
    update: useMutation({
      mutationFn: (v: { id: number; body: Body }) =>
        updateSection(v.id, v.body),
      onSettled: refresh,
    }),
    move: useMutation({
      mutationFn: (v: { id: number; dir: Direction }) =>
        moveSection(v.id, v.dir),
      onSettled: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: number) => deleteSection(id),
      onSettled: refresh,
    }),
  };
}

export function usePickMutations(id: number) {
  const refresh = useRefresh(id);
  return {
    add: useMutation({
      mutationFn: (productId: number) => addPick(id, productId),
      onSettled: refresh,
    }),
    remove: useMutation({
      mutationFn: (pickId: number) => removePick(id, pickId),
      onSettled: refresh,
    }),
    move: useMutation({
      mutationFn: (v: { pickId: number; dir: Direction }) =>
        movePick(id, v.pickId, v.dir),
      onSettled: refresh,
    }),
  };
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStaff, deleteStaff, fetchStaff, updateStaff } from './api';

export const useStaff = () =>
  useQuery({ queryKey: ['staff'], queryFn: fetchStaff });

export function useStaffMutations() {
  const qc = useQueryClient();
  const done = {
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['staff'] });
      void qc.invalidateQueries({ queryKey: ['plan'] }); // seat usage
      void qc.invalidateQueries({ queryKey: ['me'] }); // limits.can_add_staff_account
    },
  };
  return {
    create: useMutation({
      mutationFn: (b: Record<string, string>) => createStaff(b),
      ...done,
    }),
    update: useMutation({
      mutationFn: (v: { id: number; body: Record<string, string> }) =>
        updateStaff(v.id, v.body),
      ...done,
    }),
    remove: useMutation({
      mutationFn: (id: number) => deleteStaff(id),
      ...done,
    }),
  };
}

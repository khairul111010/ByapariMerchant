import { useMe } from '../features/auth/useMe';

/** Owner-only areas are hidden for staff; a 403 is still handled where it occurs. */
export function useRole() {
  const { data } = useMe();
  return { isOwner: data?.user.is_owner === true };
}

import { useMe } from '../features/auth/useMe';

/**
 * The only way UI code reads plan limits. It never branches on a plan name:
 * limits and upgrade states come from the server (`/me`, `/plan`, error codes).
 * The key list is not yet documented, so only the raw object is exposed
 * (see "Gaps" in docs/api-contract.md).
 */
export function usePlanLimits() {
  const { data } = useMe();
  return { limits: data?.limits ?? {} };
}

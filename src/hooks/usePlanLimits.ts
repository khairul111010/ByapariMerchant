import { useMe } from '../features/auth/useMe';

/**
 * The only way UI code reads plan limits. It never branches on a plan name:
 * limits and upgrade states come from the server (`/me`, `/plan`, error codes).
 * Keys come from `limits` in docs/samples.md.
 */
export function usePlanLimits() {
  const { data } = useMe();
  const limits = data?.limits;
  return {
    maxStaffAccounts: limits?.max_staff_accounts ?? null, // null = unlimited
    canAddStaffAccount: limits?.can_add_staff_account ?? false,
    customDomainEnabled: limits?.custom_domain_enabled ?? false,
    courierDrivers: limits?.courier_drivers ?? [],
    configuredCourierDrivers: limits?.configured_courier_drivers ?? [],
  };
}

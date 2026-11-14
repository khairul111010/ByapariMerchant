import { useMe } from '../features/auth/useMe';

/**
 * The only way UI code reads plan limits. It never branches on a plan name:
 * limits and upgrade states come from the server (`/me`, `/plan`, error codes).
 * Keys come from `limits` in docs/api-contract.md (`GET /me`).
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
    /** Hard cap on products; null = unlimited. */
    maxProducts: limits?.max_products ?? null,
    /** Unknown (older server or no `/me` yet) counts as allowed: the server still refuses with a 403. */
    canAddProduct: limits?.can_add_product ?? true,
    /** Soft monthly limit; it only ever warns, orders are never blocked. */
    maxOrdersPerMonth: limits?.max_orders_per_month ?? null,
    orderLimitState: limits?.order_limit_state ?? 'ok',
  };
}

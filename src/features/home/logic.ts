import type { OrderStatus } from '../../api/schemas/orders';
import { toISODate, todayInDhaka } from '../../ui/calendar';

export type Greeting = 'morning' | 'afternoon' | 'evening' | 'night';

/** Greeting by the hour in Dhaka (UTC+6), whatever the phone's timezone is set to. */
export function greetingFor(now: number = Date.now()): Greeting {
  const hour = new Date(now + 6 * 60 * 60 * 1000).getUTCHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  if (hour >= 17 && hour < 21) {
    return 'evening';
  }
  return 'night';
}

/** Today as a one-day custom dashboard range (both dates are required together). */
export function todayRange(now: number = Date.now()): { from: string; to: string } {
  const d = toISODate(todayInDhaka(now));
  return { from: d, to: d };
}

/**
 * The public shop link to share. The server's `storefront_url` wins; otherwise it is the store's
 * own host (the API base without `/api/v1`). Null if neither is known.
 */
export function storefrontLink(store: { storefront_url?: string; api_base_url?: string } | undefined): string | null {
  if (store?.storefront_url) {
    return store.storefront_url;
  }
  const origin = store?.api_base_url?.match(/^https?:\/\/[^/]+/i)?.[0];
  return origin ? `${origin}/` : null;
}

/** The usual next step for an order, or null when it is finished (delivered or cancelled). */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  return ({ pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered' } as Partial<Record<OrderStatus, OrderStatus>>)[status] ?? null;
}

/** The first letter of the shop name for the avatar circle (works for Bangla too). */
export const initialOf = (name: string | undefined): string => (name ? Array.from(name.trim())[0]?.toUpperCase() ?? '' : '');

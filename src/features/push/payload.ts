export interface NewOrderPush {
  type: 'new_order';
  orderId: number;
}

/**
 * FCM `data` values are always strings. Only `new_order` exists today; any
 * other or malformed payload returns null so future types never crash the app.
 */
export function parsePush(data: Record<string, unknown> | undefined | null): NewOrderPush | null {
  if (!data || data.type !== 'new_order') {
    return null;
  }
  const id = Number(data.order_id);
  return Number.isInteger(id) && id > 0 ? { type: 'new_order', orderId: id } : null;
}

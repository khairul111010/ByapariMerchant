import React, { useEffect, useState } from 'react';
import { usePendingOrder } from '../../store/pendingOrder';
import { OrderDetailScreen } from './OrderDetailScreen';
import { OrdersListScreen } from './OrdersListScreen';

export function OrdersTab() {
  const [openId, setOpenId] = useState<number | null>(null);
  const pending = usePendingOrder((s) => s.orderId);
  const clear = usePendingOrder((s) => s.clear);

  // A push tap opens that order's detail, then the request is consumed.
  useEffect(() => {
    if (pending !== null) {
      setOpenId(pending);
      clear();
    }
  }, [pending, clear]);

  return openId === null ? (
    <OrdersListScreen onOpen={setOpenId} />
  ) : (
    <OrderDetailScreen id={openId} onBack={() => setOpenId(null)} />
  );
}

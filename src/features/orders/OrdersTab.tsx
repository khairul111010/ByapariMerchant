import React, { useEffect, useState } from 'react';
import type { OrderStatus } from '../../api/schemas/orders';
import { useJump } from '../../store/jump';
import { usePendingOrder } from '../../store/pendingOrder';
import { OrderDetailScreen } from './OrderDetailScreen';
import { OrdersListScreen } from './OrdersListScreen';

export function OrdersTab() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<{ status?: OrderStatus; key: number }>({
    key: 0,
  });
  const pending = usePendingOrder(s => s.orderId);
  const clear = usePendingOrder(s => s.clear);
  const jump = useJump(s => s.target);
  const clearJump = useJump(s => s.clear);

  // A push tap opens that order's detail, then the request is consumed.
  useEffect(() => {
    if (pending !== null) {
      setOpenId(pending);
      clear();
    }
  }, [pending, clear]);

  // "Orders to confirm" on Home opens the list filtered to that status.
  useEffect(() => {
    if (jump?.tab === 'Orders') {
      setOpenId(null);
      setFilter(f => ({ status: jump.status, key: f.key + 1 }));
      clearJump();
    }
  }, [jump, clearJump]);

  return openId === null ? (
    <OrdersListScreen
      key={filter.key}
      initialStatus={filter.status}
      onOpen={setOpenId}
    />
  ) : (
    <OrderDetailScreen id={openId} onBack={() => setOpenId(null)} />
  );
}

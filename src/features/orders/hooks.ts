import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../api/errors';
import { OrderDetail, OrderStatus } from '../../api/schemas/orders';
import { offlineQueue } from '../../offline/instance';
import { useSession } from '../../store/session';
import {
  addAdvancePayment,
  AdvanceMethod,
  bookCourier,
  fetchOrder,
  fetchOrders,
  OrderFilters,
  refreshCourier,
  rejectPayment,
  updateOrderStatus,
  verifyPayment,
} from './api';

export const ordersKey = (f: OrderFilters) => ['orders', f] as const;
export const orderKey = (id: number) => ['order', id] as const;

export function useOrders(filters: OrderFilters) {
  const signedIn = useSession((s) => s.status === 'signedIn');
  return useInfiniteQuery({
    queryKey: ordersKey(filters),
    queryFn: ({ pageParam }) => fetchOrders(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined,
    enabled: signedIn,
    // Push is best-effort, so poll gently while the list is on screen.
    refetchInterval: 60_000,
  });
}

export function useOrder(id: number) {
  return useQuery({ queryKey: orderKey(id), queryFn: () => fetchOrder(id) });
}

/** Resolves 'queued' when offline: the write is saved and replays on reconnect. */
async function orPark<T>(attempt: () => Promise<T>, park: () => void): Promise<T | 'queued'> {
  try {
    return await attempt();
  } catch (e) {
    if (e instanceof ApiError && e.kind === 'network') {
      park();
      return 'queued';
    }
    throw e;
  }
}

export function useChangeStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) =>
      orPark(
        () => updateOrderStatus(id, status),
        () =>
          offlineQueue.enqueue({
            key: `order:${id}:status`,
            kind: 'order_status',
            orderId: id,
            payload: { status },
          }),
      ),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: orderKey(id) });
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/** Actions that return the full order: put it straight into the cache. */
function useOrderAction<V>(
  id: number,
  fn: (id: number, v: V) => Promise<OrderDetail>,
  /** Set only for idempotent actions that are safe to replay offline. */
  queueKind?: 'payment_verify' | 'payment_reject',
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: V) =>
      queueKind
        ? orPark(
            () => fn(id, v),
            () => offlineQueue.enqueue({ key: `order:${id}:payment`, kind: queueKind, orderId: id, payload: {} }),
          )
        : fn(id, v),
    onSuccess: (order) => {
      if (order === 'queued') {
        return;
      }
      qc.setQueryData(orderKey(id), order);
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export const useVerifyPayment = (id: number) =>
  useOrderAction<void>(id, (i) => verifyPayment(i), 'payment_verify');
export const useRejectPayment = (id: number) =>
  useOrderAction<void>(id, (i) => rejectPayment(i), 'payment_reject');
export const useAddAdvance = (id: number) =>
  useOrderAction<{ method: AdvanceMethod; amount: string; reference_number?: string }>(id, addAdvancePayment);

function useCourierAction(id: number, fn: (id: number, driver: string) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (driver: string) => fn(id, driver),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: orderKey(id) });
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export const useBookCourier = (id: number) => useCourierAction(id, bookCourier);
export const useRefreshCourier = (id: number) => useCourierAction(id, (i) => refreshCourier(i));

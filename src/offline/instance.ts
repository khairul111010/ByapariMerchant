import { kv } from '../storage/mmkv';
import { onSessionWipe } from '../store/session';
import { queryClient } from '../app/queryClient';
import { rejectPayment, updateOrderStatus, verifyPayment } from '../features/orders/api';
import { OrderStatus } from '../api/schemas/orders';
import { createQueue, Job } from './queue';

const KEY = 'offline.queue';

const load = (): Job[] => {
  try {
    const raw = kv.getString(KEY);
    return raw ? (JSON.parse(raw) as Job[]) : [];
  } catch {
    return [];
  }
};

async function run(job: Job): Promise<void> {
  switch (job.kind) {
    case 'order_status':
      await updateOrderStatus(job.orderId, job.payload.status as OrderStatus);
      break;
    case 'payment_verify':
      await verifyPayment(job.orderId);
      break;
    case 'payment_reject':
      await rejectPayment(job.orderId);
      break;
  }
  void queryClient.invalidateQueries({ queryKey: ['order', job.orderId] });
  void queryClient.invalidateQueries({ queryKey: ['orders'] });
}

export const offlineQueue = createQueue({
  load,
  save: (jobs) => kv.set(KEY, JSON.stringify(jobs)),
  run,
});

// Never replay one login's writes under the next.
onSessionWipe(() => {
  offlineQueue.clear();
  kv.remove(KEY);
});

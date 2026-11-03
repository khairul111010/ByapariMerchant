import { ApiError } from '../src/api/errors';
import { createQueue, Job } from '../src/offline/queue';

function setup(run: (j: Job) => Promise<void>, initial: Job[] = []) {
  let stored = initial;
  const q = createQueue({ load: () => stored, save: (j) => (stored = j), run });
  return { q, stored: () => stored };
}
const status = (orderId: number, s: string) => ({
  key: `order:${orderId}:status`, kind: 'order_status' as const, orderId, payload: { status: s },
});

describe('offline queue', () => {
  it('runs jobs in order and removes them on success', async () => {
    const seen: number[] = [];
    const { q, stored } = setup(async (j) => void seen.push(j.orderId));
    q.enqueue(status(1, 'confirmed'));
    q.enqueue(status(2, 'shipped'));
    await q.flush();
    expect(seen).toEqual([1, 2]);
    expect(stored()).toEqual([]);
  });

  it('keeps a job and stops on a network error', async () => {
    const run = jest.fn().mockRejectedValue(new ApiError('network', 0));
    const { q } = setup(run);
    q.enqueue(status(1, 'confirmed'));
    q.enqueue(status(2, 'shipped'));
    await q.flush();
    expect(run).toHaveBeenCalledTimes(1); // second job not tried while offline
    expect(q.list().map((j) => j.state)).toEqual(['queued', 'queued']);
  });

  it('marks a refusal as failed with its code, no auto-retry, and continues', async () => {
    const run = jest
      .fn()
      .mockRejectedValueOnce(new ApiError('conflict', 409, { code: 'insufficient_stock', message: 'secret text' }))
      .mockResolvedValueOnce(undefined);
    const { q } = setup(run);
    q.enqueue(status(1, 'pending'));
    q.enqueue(status(2, 'shipped'));
    await q.flush();
    const [a] = q.list();
    expect(a).toMatchObject({ orderId: 1, state: 'failed', error: 'insufficient_stock' });
    expect(JSON.stringify(q.list())).not.toContain('secret text');
    expect(q.list()).toHaveLength(1);
    await q.flush();
    expect(run).toHaveBeenCalledTimes(2); // failed job was not retried
  });

  it('latest queued status for an order replaces the older one', () => {
    const { q } = setup(async () => {});
    q.enqueue(status(1, 'confirmed'));
    q.enqueue(status(1, 'shipped'));
    expect(q.list()).toHaveLength(1);
    expect(q.list()[0].payload).toEqual({ status: 'shipped' });
  });

  it('retry requeues a failed job; discard removes it', async () => {
    const run = jest.fn().mockRejectedValueOnce(new ApiError('conflict', 409, { code: 'x' })).mockResolvedValue(undefined);
    const { q } = setup(run);
    const job = q.enqueue(status(1, 'pending'));
    await q.flush();
    q.retry(job.id);
    expect(q.list()[0].state).toBe('queued');
    await q.flush();
    expect(q.list()).toEqual([]);
    const j2 = q.enqueue(status(2, 'shipped'));
    q.discard(j2.id);
    expect(q.list()).toEqual([]);
  });

  it('survives a restart: persisted jobs reload, interrupted ones become queued', () => {
    const interrupted: Job = { ...status(1, 'x'), id: 'a', kind: 'order_status', state: 'syncing', attempts: 1, createdAt: 1, payload: {} };
    const { q } = setup(async () => {}, [interrupted]);
    expect(q.list()[0].state).toBe('queued');
  });

  it('does not run two flushes at once', async () => {
    let release!: () => void;
    const run = jest.fn(() => new Promise<void>((r) => (release = r)));
    const { q } = setup(run);
    q.enqueue(status(1, 'confirmed'));
    const first = q.flush();
    await q.flush();
    release();
    await first;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('clear wipes everything (logout)', () => {
    const { q, stored } = setup(async () => {});
    q.enqueue(status(1, 'confirmed'));
    q.clear();
    expect(stored()).toEqual([]);
  });
});

import { ApiError } from '../api/errors';

export type JobState = 'queued' | 'syncing' | 'failed';

export interface Job {
  id: string;
  /** Jobs with the same key replace each other while still queued (latest wins). */
  key: string;
  kind: 'order_status' | 'payment_verify' | 'payment_reject';
  orderId: number;
  payload: Record<string, unknown>;
  state: JobState;
  attempts: number;
  /** Set when state is 'failed': the error kind/code, never server text. */
  error?: string;
  createdAt: number;
}

export interface QueueDeps {
  load: () => Job[];
  save: (jobs: Job[]) => void;
  run: (job: Job) => Promise<void>;
  now?: () => number;
}

/**
 * Persisted FIFO of safe, idempotent writes. A network error keeps the job and
 * stops the run (still offline); any other API error is a real refusal, so the
 * job is marked failed for the user to see and is not retried automatically.
 */
export function createQueue(deps: QueueDeps) {
  const now = deps.now ?? Date.now;
  let jobs = deps.load().map((j) => (j.state === 'syncing' ? { ...j, state: 'queued' as const } : j));
  const listeners = new Set<() => void>();
  let flushing = false;
  let seq = 0;

  const commit = (next: Job[]) => {
    jobs = next;
    deps.save(jobs);
    listeners.forEach((l) => l());
  };

  return {
    list: () => jobs,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => void listeners.delete(l);
    },

    enqueue(input: Pick<Job, 'key' | 'kind' | 'orderId' | 'payload'>) {
      const job: Job = {
        ...input,
        id: `${now()}-${seq++}`,
        state: 'queued',
        attempts: 0,
        createdAt: now(),
      };
      // Replace an older, not-yet-sent job for the same thing.
      commit([...jobs.filter((j) => !(j.key === input.key && j.state === 'queued')), job]);
      return job;
    },

    async flush() {
      if (flushing) {
        return;
      }
      flushing = true;
      try {
        for (const job of jobs.filter((j) => j.state === 'queued')) {
          commit(jobs.map((j) => (j.id === job.id ? { ...j, state: 'syncing', attempts: j.attempts + 1 } : j)));
          try {
            await deps.run(job);
            commit(jobs.filter((j) => j.id !== job.id));
          } catch (e) {
            if (e instanceof ApiError && e.kind === 'network') {
              commit(jobs.map((j) => (j.id === job.id ? { ...j, state: 'queued' } : j)));
              return; // still offline: stop and wait for the next trigger
            }
            const reason = e instanceof ApiError ? e.code ?? e.kind : 'server';
            commit(jobs.map((j) => (j.id === job.id ? { ...j, state: 'failed', error: reason } : j)));
          }
        }
      } finally {
        flushing = false;
      }
    },

    retry(id: string) {
      commit(jobs.map((j) => (j.id === id && j.state === 'failed' ? { ...j, state: 'queued', error: undefined } : j)));
    },

    discard(id: string) {
      commit(jobs.filter((j) => j.id !== id));
    },

    clear() {
      commit([]);
    },
  };
}

export type Queue = ReturnType<typeof createQueue>;

import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { ApiError } from '../api/errors';
import { kv } from '../storage/mmkv';
import { onSessionWipe } from '../store/session';
import { reportError } from '../telemetry/crash';

const CACHE_KEY = 'rq.cache';

/**
 * Bump when a cached reply's shape changes, so a phone never renders an old persisted reply
 * with new code. 2026-11-14: `/plan` usage.products/orders changed from "unlimited" to objects.
 */
export const CACHE_BUSTER = '2026-11-14';

// Only unexpected failures are worth a crash report; 4xx and offline are normal.
const reportIfUnexpected = (err: unknown) => {
  if (!(err instanceof ApiError) || err.kind === 'server' || err.kind === 'invalid_response') {
    reportError(err);
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportIfUnexpected }),
  mutationCache: new MutationCache({ onError: reportIfUnexpected }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: (count, err) => {
        // Never retry things a retry cannot fix.
        if (err instanceof ApiError && err.kind !== 'network' && err.kind !== 'server') {
          return false;
        }
        return count < 2;
      },
    },
  },
});

export const persister: Persister = {
  persistClient: async (client: PersistedClient) => {
    kv.set(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const raw = kv.getString(CACHE_KEY);
    return raw ? (JSON.parse(raw) as PersistedClient) : undefined;
  },
  removeClient: async () => {
    kv.remove(CACHE_KEY);
  },
};

// Never share cache between logins.
onSessionWipe(() => queryClient.clear());

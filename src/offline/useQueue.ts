import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Job } from './queue';
import { offlineQueue } from './instance';

// useSyncExternalStore needs a stable snapshot between changes.
let snapshot: Job[] = offlineQueue.list();
const subscribe = (cb: () => void) =>
  offlineQueue.subscribe(() => {
    snapshot = offlineQueue.list();
    cb();
  });

export const useQueuedJobs = (): Job[] => useSyncExternalStore(subscribe, () => snapshot);

export const useOrderJobs = (orderId: number): Job[] => {
  const jobs = useQueuedJobs();
  return jobs.filter((j) => j.orderId === orderId);
};

/** Flushes at startup, on reconnect and on foreground. Mount once while signed in. */
export function useQueueSync() {
  useEffect(() => {
    void offlineQueue.flush();
    const net = NetInfo.addEventListener((s) => {
      if (s.isConnected && s.isInternetReachable !== false) {
        void offlineQueue.flush();
      }
    });
    const app = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        void offlineQueue.flush();
      }
    });
    return () => {
      net();
      app.remove();
    };
  }, []);
}

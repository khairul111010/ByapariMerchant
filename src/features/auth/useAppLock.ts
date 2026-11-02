import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { shouldLock, useLock } from '../../store/lock';

/** Locks when the app returns from the background after a while. */
export function useAppLock() {
  const leftAt = useRef<number | null>(null);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        leftAt.current = Date.now();
      } else if (state === 'active' && leftAt.current !== null) {
        const { enabled, lock } = useLock.getState();
        if (shouldLock(enabled, Date.now() - leftAt.current)) {
          lock();
        }
        leftAt.current = null;
      }
    });
    return () => sub.remove();
  }, []);
}

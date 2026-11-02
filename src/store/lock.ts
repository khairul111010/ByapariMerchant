import { create } from 'zustand';
import { KV_KEYS, kv } from '../storage/mmkv';
import { onSessionWipe } from './session';

/** Re-lock only if the app was away for longer than this. */
export const RELOCK_AFTER_MS = 30_000;

export const shouldLock = (enabled: boolean, awayMs: number): boolean =>
  enabled && awayMs > RELOCK_AFTER_MS;

interface LockState {
  enabled: boolean;
  locked: boolean;
  setEnabled: (v: boolean) => void;
  lock: () => void;
  unlock: () => void;
  /** Called once after hydrate: lock cold starts when the user enabled it. */
  initForSignedIn: () => void;
}

export const useLock = create<LockState>((set, get) => ({
  enabled: kv.getBoolean(KV_KEYS.biometricLock) ?? false,
  locked: false,
  setEnabled: (enabled) => {
    kv.set(KV_KEYS.biometricLock, enabled);
    set({ enabled, locked: false });
  },
  lock: () => set({ locked: get().enabled }),
  unlock: () => set({ locked: false }),
  initForSignedIn: () => set({ locked: get().enabled }),
}));

// Never carry one login's preference into the next.
onSessionWipe(() => useLock.setState({ enabled: false, locked: false }));

import { create } from 'zustand';
import { KV_KEYS, kv } from '../storage/mmkv';
import { clearToken, loadToken, saveToken } from '../storage/secure';

type Status = 'booting' | 'signedOut' | 'signedIn';

interface SessionState {
  status: Status;
  token: string | null;
  apiBaseUrl: string | null;
  storeSuspended: boolean;
  /** Reads keychain + MMKV once at launch. */
  hydrate: () => Promise<void>;
  signIn: (token: string, apiBaseUrl: string) => Promise<void>;
  setSuspended: (v: boolean) => void;
  /** Wipes token, caches and the offline queue. Language is the one thing kept. */
  signOut: () => Promise<void>;
}

/** Hooks other modules register so logout can clear their own state. */
const wipeHooks: Array<() => void | Promise<void>> = [];
export const onSessionWipe = (fn: () => void | Promise<void>) => {
  wipeHooks.push(fn);
};

export const useSession = create<SessionState>((set) => ({
  status: 'booting',
  token: null,
  apiBaseUrl: null,
  storeSuspended: false,

  hydrate: async () => {
    const token = await loadToken();
    const apiBaseUrl = kv.getString(KV_KEYS.apiBaseUrl) ?? null;
    if (token && apiBaseUrl) {
      set({ status: 'signedIn', token, apiBaseUrl });
    } else {
      set({ status: 'signedOut', token: null, apiBaseUrl: null });
    }
  },

  signIn: async (token, apiBaseUrl) => {
    await saveToken(token);
    kv.set(KV_KEYS.apiBaseUrl, apiBaseUrl);
    set({ status: 'signedIn', token, apiBaseUrl, storeSuspended: false });
  },

  setSuspended: (storeSuspended) => set({ storeSuspended }),

  signOut: async () => {
    const language = kv.getString(KV_KEYS.language);
    await clearToken();
    kv.clearAll();
    if (language) {
      kv.set(KV_KEYS.language, language);
    }
    for (const fn of wipeHooks) {
      await fn();
    }
    set({
      status: 'signedOut',
      token: null,
      apiBaseUrl: null,
      storeSuspended: false,
    });
  },
}));

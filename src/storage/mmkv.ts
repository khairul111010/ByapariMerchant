import { createMMKV } from 'react-native-mmkv';

/** Non-sensitive cache, preferences and the offline queue. Secrets go in keychain. */
export const kv = createMMKV({ id: 'bypari' });

export const KV_KEYS = {
  language: 'pref.language',
  apiBaseUrl: 'session.apiBaseUrl',
  shopAddress: 'session.shopAddress',
  biometricLock: 'pref.biometricLock',
} as const;

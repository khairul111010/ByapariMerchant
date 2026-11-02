const mockStore = new Map();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getBoolean: k => (mockStore.has(k) ? mockStore.get(k) : undefined),
    getString: k => (mockStore.has(k) ? mockStore.get(k) : undefined),
    set: (k, v) => void mockStore.set(k, v),
    remove: k => mockStore.delete(k),
    clearAll: () => mockStore.clear(),
  }),
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en', countryCode: 'US' }],
}));

jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: class {
    isSensorAvailable() {
      return Promise.resolve({ available: false });
    }
    simplePrompt() {
      return Promise.resolve({ success: false });
    }
  },
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(),
  log: jest.fn(),
  recordError: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(null),
}));

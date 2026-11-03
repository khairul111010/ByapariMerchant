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

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('orders'),
    displayNotification: jest.fn().mockResolvedValue('id'),
    onForegroundEvent: jest.fn(() => () => {}),
    onBackgroundEvent: jest.fn(),
  },
  AndroidImportance: { HIGH: 4 },
  EventType: { PRESS: 1 },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(),
  getToken: jest.fn().mockResolvedValue('tok'),
  onMessage: jest.fn(() => () => {}),
  onNotificationOpenedApp: jest.fn(() => () => {}),
  onTokenRefresh: jest.fn(() => () => {}),
  getInitialNotification: jest.fn().mockResolvedValue(null),
  requestPermission: jest.fn().mockResolvedValue(1),
  setBackgroundMessageHandler: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { addEventListener: jest.fn(() => () => {}) },
}));

jest.mock('react-native-html-to-pdf', () => ({
  generatePDF: jest.fn().mockResolvedValue({ filePath: '/tmp/x.pdf' }),
}));
jest.mock('react-native-share', () => ({
  __esModule: true,
  default: { open: jest.fn().mockResolvedValue({}) },
}));

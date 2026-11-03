import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { queryClient } from '../../app/queryClient';
import { usePendingOrder } from '../../store/pendingOrder';
import { parsePush } from './payload';
import { registerDevice, unregisterDevice } from './register';

export const ORDERS_CHANNEL = 'orders';

/** Must exist before the first push arrives. Safe to call repeatedly. */
export async function ensureChannel(name: string): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await notifee.createChannel({
    id: ORDERS_CHANNEL,
    name,
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

async function askPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return r === PermissionsAndroid.RESULTS.GRANTED;
  }
  await requestPermission(getMessaging());
  return true;
}

const refreshOrders = () => {
  void queryClient.invalidateQueries({ queryKey: ['orders'] });
  void queryClient.invalidateQueries({ queryKey: ['me'] });
};

let currentToken: string | null = null;

/** Wires permission, channel, device registration and tap handling. Returns a cleanup. */
export async function startPush(channelName: string): Promise<() => void> {
  await ensureChannel(channelName);
  await askPermission();
  const messaging = getMessaging();
  const unsubs: Array<() => void> = [];

  const sync = async (token: string) => {
    currentToken = token;
    try {
      await registerDevice(token);
    } catch {
      // Best effort: retried on next launch or rotation.
    }
  };

  try {
    await sync(await getToken(messaging));
  } catch {}
  unsubs.push(onTokenRefresh(messaging, (t) => void sync(t)));

  // Foreground: FCM shows nothing by itself, so display it and refresh data.
  unsubs.push(
    onMessage(messaging, async (msg) => {
      refreshOrders();
      if (msg.notification) {
        await notifee.displayNotification({
          title: msg.notification.title,
          body: msg.notification.body,
          data: msg.data as Record<string, string> | undefined,
          android: { channelId: ORDERS_CHANNEL, pressAction: { id: 'default' } },
        });
      }
    }),
  );

  const open = (data: Record<string, unknown> | undefined) => {
    const push = parsePush(data);
    if (push) {
      usePendingOrder.getState().open(push.orderId);
      refreshOrders();
    }
  };

  // Background tap, killed-state tap, and taps on notifications we displayed in the foreground.
  unsubs.push(onNotificationOpenedApp(messaging, (m) => open(m.data)));
  const initial = await getInitialNotification(messaging);
  if (initial) {
    open(initial.data);
  }
  unsubs.push(
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        open(detail.notification?.data);
      }
    }),
  );

  return () => unsubs.forEach((u) => u());
}

/** Call before the token is wiped. Never throws: logout must always complete. */
export async function stopPush(): Promise<void> {
  if (!currentToken) {
    return;
  }
  try {
    await unregisterDevice(currentToken);
  } catch {}
  currentToken = null;
}

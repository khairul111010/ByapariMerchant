/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Background/killed: the system tray shows the FCM notification itself; these only
// satisfy the SDKs. Taps are handled via getInitialNotification / onNotificationOpenedApp.
setBackgroundMessageHandler(getMessaging(), async () => {});
notifee.onBackgroundEvent(async () => {});

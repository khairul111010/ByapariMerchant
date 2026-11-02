import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { setLanguage, useLang } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { useLock } from '../../store/lock';
import { useSession } from '../../store/session';
import { Button, Text } from '../../ui';
import { colors, font, spacing } from '../../ui/theme';
import { logoutRequest } from '../auth/api';
import { authenticate, isBiometricAvailable } from '../auth/biometric';
import { PendingBanner } from './PendingBanner';

const Tab = createBottomTabNavigator();

function Placeholder({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.screen}>
      <PendingBanner />
      <View style={styles.body}>
        <Text variant="title">{title}</Text>
        <Text variant="muted">{t('placeholder.comingSoon')}</Text>
      </View>
    </View>
  );
}

function MoreScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const { isOwner } = useRole();
  const signOut = useSession((s) => s.signOut);
  const lockEnabled = useLock((s) => s.enabled);
  const setLockEnabled = useLock((s) => s.setEnabled);
  const [bioAvailable, setBioAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvailable);
  }, []);

  const toggleLock = async () => {
    if (lockEnabled) {
      setLockEnabled(false);
    } else if (await authenticate(t('lock.prompt'))) {
      setLockEnabled(true); // only turn on after a successful check
    }
  };

  const doSignOut = async () => {
    try {
      await logoutRequest(); // revoke the token server-side; wipe locally regardless
    } catch {}
    await signOut();
  };

  return (
    <View style={styles.screen}>
      <PendingBanner />
      <View style={styles.body}>
        <Text variant="title">{t('tabs.more')}</Text>
        {isOwner ? <Text variant="label">{t('more.ownerOnly')}</Text> : null}
        <Button
          title={`${t('more.language')}: ${lang === 'bn' ? 'English' : 'বাংলা'}`}
          kind="secondary"
          onPress={() => setLanguage(lang === 'bn' ? 'en' : 'bn')}
        />
        <Button
          title={`${t('lock.setting')}: ${lockEnabled ? '✓' : '—'}`}
          kind="secondary"
          onPress={toggleLock}
          disabled={bioAvailable === false && !lockEnabled}
        />
        {bioAvailable === false ? <Text variant="muted">{t('lock.unavailable')}</Text> : null}
        <Button title={t('common.signOut')} kind="secondary" onPress={doSignOut} />
      </View>
    </View>
  );
}

export function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: font.bold, fontSize: 12 },
        tabBarStyle: { minHeight: 60, paddingBottom: 6 },
        tabBarIcon: () => null,
      }}>
      <Tab.Screen name="Dashboard" options={{ title: t('tabs.dashboard') }}>
        {() => <Placeholder title={t('tabs.dashboard')} />}
      </Tab.Screen>
      <Tab.Screen name="Orders" options={{ title: t('tabs.orders') }}>
        {() => <Placeholder title={t('tabs.orders')} />}
      </Tab.Screen>
      <Tab.Screen name="Products" options={{ title: t('tabs.products') }}>
        {() => <Placeholder title={t('tabs.products')} />}
      </Tab.Screen>
      <Tab.Screen name="Sell" options={{ title: t('tabs.sell') }}>
        {() => <Placeholder title={t('tabs.sell')} />}
      </Tab.Screen>
      <Tab.Screen name="More" component={MoreScreen} options={{ title: t('tabs.more') }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.md, justifyContent: 'center' },
});

import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage, useLang } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { useLock } from '../../store/lock';
import { useSession } from '../../store/session';
import { BrandMark } from '../../ui/Brand';
import { Pill } from '../../ui/Chips';
import { Icon } from '../../ui/Icon';
import { Sheet } from '../../ui/Sheet';
import { Button, Choice, Text } from '../../ui';
import { cardStyle, colors, spacing } from '../../ui/theme';
import { logoutRequest } from '../auth/api';
import { authenticate, isBiometricAvailable } from '../auth/biometric';
import { useMe } from '../auth/useMe';
import { stopPush } from '../push/push';
import { SettingsHub } from '../settings/SettingsHub';
import { StorefrontHub } from '../storefront/StorefrontHub';
import { PendingBanner } from './PendingBanner';

function Row({
  title,
  value,
  onPress,
  danger,
  last,
}: {
  title: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}: ${value}` : title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      <Text variant="label" style={[styles.rowTitle, danger && styles.danger]}>
        {title}
      </Text>
      {value ? <Text variant="muted">{value}</Text> : null}
      {!danger ? (
        <Icon name="chevronRight" size={20} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export function MoreScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const { isOwner } = useRole();
  const me = useMe();
  const signOut = useSession(s => s.signOut);
  const lockEnabled = useLock(s => s.enabled);
  const setLockEnabled = useLock(s => s.setEnabled);
  const [bioAvailable, setBioAvailable] = useState<boolean | null>(null);
  const [view, setView] = useState<'menu' | 'storefront' | 'settings'>('menu');
  const [langSheet, setLangSheet] = useState(false);
  const [outSheet, setOutSheet] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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
    setSigningOut(true);
    await stopPush(); // unregister this phone while the token still works
    try {
      await logoutRequest(); // revoke the token server-side; wipe locally regardless
    } catch {}
    await signOut();
  };

  if (view === 'storefront') {
    return <StorefrontHub onBack={() => setView('menu')} />;
  }
  if (view === 'settings' && isOwner) {
    return <SettingsHub onBack={() => setView('menu')} />;
  }

  return (
    <View style={styles.screen}>
      <PendingBanner />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <BrandMark size={56} />
          <View style={styles.profileText}>
            <Text variant="subtitle" numberOfLines={1}>
              {me.data?.store.name ?? ''}
            </Text>
            <Text variant="muted" numberOfLines={1}>
              {me.data?.user.name ?? ''}
            </Text>
            <Pill
              label={isOwner ? t('staff.owner') : t('staff.staff')}
              tone="brand"
            />
          </View>
        </View>

        <View style={styles.group}>
          <Row
            title={t('storefront.open')}
            onPress={() => setView('storefront')}
            last={!isOwner}
          />
          {isOwner ? (
            <Row
              title={t('settings.open')}
              onPress={() => setView('settings')}
              last
            />
          ) : null}
        </View>

        <View style={styles.group}>
          <Row
            title={t('more.language')}
            value={lang === 'bn' ? 'বাংলা' : 'English'}
            onPress={() => setLangSheet(true)}
          />
          <View style={[styles.row, styles.rowDivider]}>
            <Text variant="label" style={styles.rowTitle}>
              {t('lock.setting')}
            </Text>
            <Switch
              accessibilityLabel={t('lock.setting')}
              value={lockEnabled}
              onValueChange={() => void toggleLock()}
              disabled={bioAvailable === false && !lockEnabled}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <Row
            title={t('common.signOut')}
            onPress={() => setOutSheet(true)}
            danger
            last
          />
        </View>
        {bioAvailable === false ? (
          <Text variant="muted">{t('lock.unavailable')}</Text>
        ) : null}
      </ScrollView>

      <Sheet
        visible={langSheet}
        onClose={() => setLangSheet(false)}
        title={t('moreMenu.chooseLanguage')}
      >
        {(['bn', 'en'] as const).map(l => (
          <Choice
            key={l}
            label={l === 'bn' ? 'বাংলা' : 'English'}
            selected={lang === l}
            onPress={() => {
              setLanguage(l);
              setLangSheet(false);
            }}
          >
            <Text variant="label">{l === 'bn' ? 'বাংলা' : 'English'}</Text>
          </Choice>
        ))}
      </Sheet>

      <Sheet
        visible={outSheet}
        onClose={() => setOutSheet(false)}
        title={t('moreMenu.signOutTitle')}
      >
        <Text variant="muted">{t('moreMenu.signOutBody')}</Text>
        <Button
          title={t('common.signOut')}
          loading={signingOut}
          onPress={() => void doSignOut()}
        />
        <Button
          title={t('common.cancel')}
          kind="secondary"
          onPress={() => setOutSheet(false)}
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.lg },
  profile: {
    ...cardStyle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  profileText: { flex: 1, gap: 2 },
  group: { ...cardStyle, padding: 0, gap: 0, overflow: 'hidden' },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.surface },
  rowTitle: { flex: 1, fontSize: 16 },
  danger: { color: colors.danger },
});

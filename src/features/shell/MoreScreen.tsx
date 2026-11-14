import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Switch,
  Text as RNText,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage, useLang } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { SellScreenName, useJump } from '../../store/jump';
import { useLock } from '../../store/lock';
import { useSession } from '../../store/session';
import { Badge } from '../../ui/Badge';
import { IconName } from '../../ui/Icon';
import { MenuGroup, MenuRow } from '../../ui/Menu';
import { Sheet } from '../../ui/Sheet';
import { Button, Choice, Text } from '../../ui';
import { useStyles, useTheme } from '../../ui/ThemeProvider';
import { logoutRequest } from '../auth/api';
import { authenticate, isBiometricAvailable } from '../auth/biometric';
import { useMe } from '../auth/useMe';
import { initialOf } from '../home/logic';
import { stopPush } from '../push/push';
import { SellScreen } from '../sell/SellTab';
import { SettingsHub } from '../settings/SettingsHub';
import { StorefrontHub } from '../storefront/StorefrontHub';
import { StoreBanner } from './StoreBanner';

type View_ =
  | 'menu'
  | 'storefront'
  | 'appearance'
  | 'settings'
  | 'payments'
  | 'general'
  | 'plan'
  | { sell: SellScreenName };

function useMoreStyles() {
  return useStyles(({ c, radius, spacing, shadow, font }) => ({
    screen: { flex: 1, backgroundColor: c.background },
    body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
    profile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.xl,
      borderRadius: radius.xl,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      ...shadow.card,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: font.bold,
      fontSize: 24,
      lineHeight: 32,
      color: c.primaryFill,
    },
    profileText: { flex: 1, gap: 2 },
  }));
}

export function MoreScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const { c } = useTheme();
  const s = useMoreStyles();
  const { isOwner } = useRole();
  const me = useMe();
  const signOut = useSession(st => st.signOut);
  const lockEnabled = useLock(st => st.enabled);
  const setLockEnabled = useLock(st => st.setEnabled);
  const jump = useJump(st => st.target);
  const clearJump = useJump(st => st.clear);
  const [bioAvailable, setBioAvailable] = useState<boolean | null>(null);
  const [view, setView] = useState<View_>('menu');
  const [langSheet, setLangSheet] = useState(false);
  const [outSheet, setOutSheet] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvailable);
  }, []);

  // A Home tile, the "+" sheet or the setup checklist asked for a screen in here.
  useEffect(() => {
    if (jump?.tab === 'More') {
      setView(jump.screen);
      clearJump();
    }
  }, [jump, clearJump]);

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

  const menu = () => setView('menu');
  if (typeof view === 'object') {
    return <SellScreen name={view.sell} onBack={menu} />;
  }
  if (view === 'storefront' || view === 'appearance') {
    return (
      <StorefrontHub
        onBack={menu}
        initial={view === 'appearance' && isOwner ? 'appearance' : 'hub'}
      />
    );
  }
  if (
    (view === 'settings' ||
      view === 'payments' ||
      view === 'general' ||
      view === 'plan') &&
    isOwner
  ) {
    return (
      <SettingsHub onBack={menu} initial={view === 'settings' ? 'hub' : view} />
    );
  }

  const sell: Array<{ name: SellScreenName; icon: IconName }> = [
    { name: 'pos', icon: 'sell' },
    { name: 'customers', icon: 'users' },
    { name: 'coupons', icon: 'tag' },
    { name: 'zones', icon: 'mapPin' },
    { name: 'landing', icon: 'page' },
    { name: 'carts', icon: 'cart' },
    { name: 'reviews', icon: 'star' },
  ];

  return (
    <View style={s.screen}>
      <StoreBanner />
      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.profile}>
          <View style={s.avatar}>
            <RNText style={s.avatarText}>
              {initialOf(me.data?.store.name)}
            </RNText>
          </View>
          <View style={s.profileText}>
            <Text variant="subtitle" numberOfLines={1}>
              {me.data?.store.name ?? ''}
            </Text>
            <Text variant="muted" numberOfLines={1}>
              {me.data?.user.name ?? ''}
            </Text>
            <Badge
              label={isOwner ? t('staff.owner') : t('staff.staff')}
              tone="brand"
            />
          </View>
        </View>

        <MenuGroup label={t('sell.title')}>
          {sell.map(item => (
            <MenuRow
              key={item.name}
              icon={item.icon}
              title={t(`sell.${item.name}`)}
              hint={t(`menu.hint.${item.name}`)}
              onPress={() => setView({ sell: item.name })}
            />
          ))}
        </MenuGroup>

        <MenuGroup label={t('storefront.title')}>
          <MenuRow
            icon="store"
            title={t('storefront.open')}
            hint={t('menu.hint.storefront')}
            onPress={() => setView('storefront')}
          />
          {isOwner ? (
            <MenuRow
              icon="more"
              title={t('settings.open')}
              hint={t('menu.hint.settings')}
              onPress={() => setView('settings')}
            />
          ) : null}
        </MenuGroup>

        <MenuGroup label={t('more.account')}>
          <MenuRow
            icon="language"
            title={t('more.language')}
            value={lang === 'bn' ? 'বাংলা' : 'English'}
            onPress={() => setLangSheet(true)}
          />
          <MenuRow
            icon="lock"
            title={t('lock.setting')}
            right={
              <Switch
                accessibilityLabel={t('lock.setting')}
                value={lockEnabled}
                onValueChange={() => void toggleLock()}
                disabled={bioAvailable === false && !lockEnabled}
                trackColor={{ true: c.primary, false: c.borderStrong }}
                thumbColor={c.card}
              />
            }
          />
          <MenuRow
            icon="logout"
            title={t('common.signOut')}
            onPress={() => setOutSheet(true)}
            danger
          />
        </MenuGroup>
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

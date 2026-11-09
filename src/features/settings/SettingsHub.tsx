import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRole } from '../../hooks/useRole';
import { Text } from '../../ui';
import { MenuGroup, MenuRow } from '../../ui/Menu';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { colors, spacing } from '../../ui/theme';
import { CouriersScreen } from '../couriers/CouriersScreen';
import { PlanScreen } from '../plan/PlanScreen';
import { StaffScreen } from '../staff/StaffScreen';
import {
  AiScreen,
  GeneralSettingsScreen,
  MarketingScreen,
  PaymentsScreen,
} from './SimpleSettings';

type View =
  | 'hub'
  | 'general'
  | 'payments'
  | 'couriers'
  | 'ai'
  | 'marketing'
  | 'staff'
  | 'plan';

/** Owner-only. Staff never reach it (the entry is hidden), and a 403 is still handled on each screen. */
export function SettingsHub({
  onBack,
  initial = 'hub',
}: {
  onBack: () => void;
  initial?: View;
}) {
  const { t } = useTranslation();
  const { isOwner } = useRole();
  const [view, setView] = useState<View>(initial);
  const hub = () => setView('hub');
  const toPlan = () => setView('plan');

  if (!isOwner) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.wrap}>
        <ScreenHeader title={t('settings.title')} onBack={onBack} />
        <Text>{t('settings.ownerOnly')}</Text>
      </ScrollView>
    );
  }
  switch (view) {
    case 'general':
      return <GeneralSettingsScreen onBack={hub} />;
    case 'payments':
      return <PaymentsScreen onBack={hub} />;
    case 'couriers':
      return <CouriersScreen onBack={hub} onUpgrade={toPlan} />;
    case 'ai':
      return <AiScreen onBack={hub} />;
    case 'marketing':
      return <MarketingScreen onBack={hub} />;
    case 'staff':
      return <StaffScreen onBack={hub} onUpgrade={toPlan} />;
    case 'plan':
      return <PlanScreen onBack={hub} />;
    default:
      return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.wrap}>
          <ScreenHeader title={t('settings.title')} onBack={onBack} />
          <MenuGroup label={t('menu.groups.business')}>
            <MenuRow
              icon="store"
              title={t('settings.general')}
              hint={t('menu.hint.general')}
              onPress={() => setView('general')}
            />
            <MenuRow
              icon="card"
              title={t('settings.payments')}
              hint={t('menu.hint.payments')}
              onPress={() => setView('payments')}
            />
            <MenuRow
              icon="truck"
              title={t('couriers.title')}
              hint={t('menu.hint.couriers')}
              onPress={() => setView('couriers')}
            />
          </MenuGroup>
          <MenuGroup label={t('menu.groups.growth')}>
            <MenuRow
              icon="sparkle"
              title={t('settings.ai')}
              hint={t('menu.hint.ai')}
              onPress={() => setView('ai')}
            />
            <MenuRow
              icon="megaphone"
              title={t('settings.marketing')}
              hint={t('menu.hint.marketing')}
              onPress={() => setView('marketing')}
            />
          </MenuGroup>
          <MenuGroup label={t('menu.groups.account')}>
            <MenuRow
              icon="users"
              title={t('staff.title')}
              hint={t('menu.hint.staff')}
              onPress={() => setView('staff')}
            />
            <MenuRow
              icon="star"
              title={t('plan.title')}
              hint={t('menu.hint.plan')}
              onPress={() => setView('plan')}
            />
          </MenuGroup>
        </ScrollView>
      );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
});

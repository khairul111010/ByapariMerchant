import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRole } from '../../hooks/useRole';
import { Button, Text } from '../../ui';
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
export function SettingsHub({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { isOwner } = useRole();
  const [view, setView] = useState<View>('hub');
  const hub = () => setView('hub');
  const toPlan = () => setView('plan');

  if (!isOwner) {
    return (
      <ScrollView contentContainerStyle={styles.wrap}>
        <Button title={t('common.back')} kind="secondary" onPress={onBack} />
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
        <ScrollView contentContainerStyle={styles.wrap}>
          <Button title={t('common.back')} kind="secondary" onPress={onBack} />
          <Text variant="title">{t('settings.title')}</Text>
          <Button
            title={t('settings.general')}
            onPress={() => setView('general')}
          />
          <Button
            title={t('settings.payments')}
            kind="secondary"
            onPress={() => setView('payments')}
          />
          <Button
            title={t('couriers.title')}
            kind="secondary"
            onPress={() => setView('couriers')}
          />
          <Button
            title={t('settings.ai')}
            kind="secondary"
            onPress={() => setView('ai')}
          />
          <Button
            title={t('settings.marketing')}
            kind="secondary"
            onPress={() => setView('marketing')}
          />
          <Button
            title={t('staff.title')}
            kind="secondary"
            onPress={() => setView('staff')}
          />
          <Button
            title={t('plan.title')}
            kind="secondary"
            onPress={() => setView('plan')}
          />
        </ScrollView>
      );
  }
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
});

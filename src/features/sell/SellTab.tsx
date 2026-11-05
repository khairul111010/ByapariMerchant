import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CartsScreen } from '../carts/CartsScreen';
import { CouponsScreen } from '../coupons/CouponsScreen';
import { CustomersScreen } from '../customers/CustomersScreen';
import { LandingScreen } from '../landing/LandingScreen';
import { PosScreen } from '../pos/PosScreen';
import { ReviewsScreen } from '../reviews/ReviewsScreen';
import { ZonesScreen } from '../zones/ZonesScreen';
import { PendingBanner } from '../shell/PendingBanner';
import { Button, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';

type View =
  | { name: 'hub' }
  | { name: 'pos' }
  | { name: 'customers' }
  | { name: 'carts' }
  | { name: 'reviews' }
  | { name: 'coupons' }
  | { name: 'zones' }
  | { name: 'landing' };

export function SellTab() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>({ name: 'hub' });
  const hub = () => setView({ name: 'hub' });

  if (view.name === 'pos') {
    return <PosScreen onBack={hub} />;
  }
  if (view.name === 'customers') {
    return <CustomersScreen onBack={hub} />;
  }
  if (view.name === 'carts') {
    return <CartsScreen onBack={hub} />;
  }
  if (view.name === 'reviews') {
    return <ReviewsScreen onBack={hub} />;
  }
  if (view.name === 'coupons') {
    return <CouponsScreen onBack={hub} />;
  }
  if (view.name === 'zones') {
    return <ZonesScreen onBack={hub} />;
  }
  if (view.name === 'landing') {
    return <LandingScreen onBack={hub} />;
  }
  return (
    <>
      <PendingBanner />
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text variant="title">{t('sell.title')}</Text>
        <Button
          title={t('sell.pos')}
          onPress={() => setView({ name: 'pos' })}
        />
        <Button
          title={t('sell.customers')}
          kind="secondary"
          onPress={() => setView({ name: 'customers' })}
        />
        <Button
          title={t('sell.carts')}
          kind="secondary"
          onPress={() => setView({ name: 'carts' })}
        />
        <Button
          title={t('sell.reviews')}
          kind="secondary"
          onPress={() => setView({ name: 'reviews' })}
        />
        <Button
          title={t('sell.coupons')}
          kind="secondary"
          onPress={() => setView({ name: 'coupons' })}
        />
        <Button
          title={t('sell.zones')}
          kind="secondary"
          onPress={() => setView({ name: 'zones' })}
        />
        <Button
          title={t('sell.landing')}
          kind="secondary"
          onPress={() => setView({ name: 'landing' })}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
});

import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRole } from '../../hooks/useRole';
import { AppearanceScreen } from '../appearance/AppearanceScreen';
import { BannersScreen } from '../banners/BannersScreen';
import { SectionsScreen } from '../sections/SectionsScreen';
import { Button, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';

type View =
  | { name: 'hub' }
  | { name: 'banners' }
  | { name: 'sections' }
  | { name: 'appearance' };

/** Everything that shapes the public shop. Appearance is owner only, so staff never see it. */
export function StorefrontHub({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { isOwner } = useRole();
  const [view, setView] = useState<View>({ name: 'hub' });
  const hub = () => setView({ name: 'hub' });

  if (view.name === 'banners') {
    return <BannersScreen onBack={hub} />;
  }
  if (view.name === 'sections') {
    return <SectionsScreen onBack={hub} />;
  }
  if (view.name === 'appearance' && isOwner) {
    return <AppearanceScreen onBack={hub} />;
  }
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('storefront.title')}</Text>
      <Button
        title={t('banners.title')}
        onPress={() => setView({ name: 'banners' })}
      />
      <Button
        title={t('sections.title')}
        kind="secondary"
        onPress={() => setView({ name: 'sections' })}
      />
      {isOwner ? (
        <Button
          title={t('appearance.title')}
          kind="secondary"
          onPress={() => setView({ name: 'appearance' })}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
});

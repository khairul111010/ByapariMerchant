import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRole } from '../../hooks/useRole';
import { AppearanceScreen } from '../appearance/AppearanceScreen';
import { BannersScreen } from '../banners/BannersScreen';
import { SectionsScreen } from '../sections/SectionsScreen';
import { MenuGroup, MenuRow } from '../../ui/Menu';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { colors, spacing } from '../../ui/theme';

type View =
  | { name: 'hub' }
  | { name: 'banners' }
  | { name: 'sections' }
  | { name: 'appearance' };

/** Everything that shapes the public shop. Appearance is owner only, so staff never see it. */
export function StorefrontHub({
  onBack,
  initial = 'hub',
}: {
  onBack: () => void;
  initial?: View['name'];
}) {
  const { t } = useTranslation();
  const { isOwner } = useRole();
  const [view, setView] = useState<View>({ name: initial } as View);
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.wrap}>
      <ScreenHeader title={t('storefront.title')} onBack={onBack} />
      <MenuGroup>
        <MenuRow
          icon="image"
          title={t('banners.title')}
          hint={t('menu.hint.banners')}
          onPress={() => setView({ name: 'banners' })}
        />
        <MenuRow
          icon="layout"
          title={t('sections.title')}
          hint={t('menu.hint.sections')}
          onPress={() => setView({ name: 'sections' })}
        />
        {isOwner ? (
          <MenuRow
            icon="palette"
            title={t('appearance.title')}
            hint={t('menu.hint.appearance')}
            onPress={() => setView({ name: 'appearance' })}
          />
        ) : null}
      </MenuGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
});

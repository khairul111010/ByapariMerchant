import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../i18n';
import { BrandLogo } from '../../ui/Brand';
import { Button, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';

export function LanguageScreen({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const pick = (lang: 'bn' | 'en') => {
    setLanguage(lang);
    onDone();
  };
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <BrandLogo height={56} />
      </View>
      <View style={styles.body}>
        <Text variant="display">{t('language.title')}</Text>
        <Text variant="muted">{t('language.subtitle')}</Text>
        <View style={styles.buttons}>
          <Button title={t('language.bn')} onPress={() => pick('bn')} />
          <Button
            title={t('language.en')}
            kind="secondary"
            onPress={() => pick('en')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { gap: spacing.md, paddingBottom: spacing.xl },
  buttons: { gap: spacing.md, marginTop: spacing.xl },
});

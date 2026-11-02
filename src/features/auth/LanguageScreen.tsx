import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../i18n';
import { Button, Text } from '../../ui';
import { spacing } from '../../ui/theme';

export function LanguageScreen({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const pick = (lang: 'bn' | 'en') => {
    setLanguage(lang);
    onDone();
  };
  return (
    <View style={styles.wrap}>
      <Text variant="title">{t('language.title')}</Text>
      <Text variant="muted">{t('language.subtitle')}</Text>
      <View style={styles.buttons}>
        <Button title={t('language.bn')} onPress={() => pick('bn')} />
        <Button title={t('language.en')} kind="secondary" onPress={() => pick('en')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.md },
  buttons: { gap: spacing.md, marginTop: spacing.xl },
});

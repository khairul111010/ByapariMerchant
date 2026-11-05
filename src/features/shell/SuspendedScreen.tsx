import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSession } from '../../store/session';
import { Button, Text } from '../../ui';
import { spacing } from '../../ui/theme';

export function SuspendedScreen() {
  const { t } = useTranslation();
  const signOut = useSession(s => s.signOut);
  return (
    <View style={styles.wrap}>
      <Text variant="title">{t('suspended.title')}</Text>
      <Text>{t('suspended.body')}</Text>
      <Button
        title={t('common.signOut')}
        kind="secondary"
        onPress={() => void signOut()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
});

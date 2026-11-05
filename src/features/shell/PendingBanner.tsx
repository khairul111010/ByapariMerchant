import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMe } from '../auth/useMe';
import { Text } from '../../ui';
import { colors, radius, spacing, touch } from '../../ui/theme';

/** Shown while the operator has not approved the store yet. */
export function PendingBanner() {
  const { t } = useTranslation();
  const { data } = useMe();
  if (!data?.store.is_pending) {
    return null;
  }
  const url = data.platform.support_whatsapp_url;
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{t('pending.banner')}</Text>
      {url ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('pending.action')}
          style={styles.action}
          onPress={() => void Linking.openURL(url)}
        >
          <Text variant="label" style={styles.actionText}>
            {t('pending.action')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.warningBg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  text: { color: colors.warningText },
  action: {
    minHeight: touch,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.warningText,
  },
  actionText: { color: colors.warningText },
});

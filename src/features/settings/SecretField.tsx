import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Field, Text } from '../../ui';
import { colors, radius, spacing } from '../../ui/theme';

/**
 * A write-only secret. A stored secret shows only as "Configured ✓" with Replace and Clear, and
 * is never echoed or prefilled. A blank field means "unchanged".
 */
export function SecretField({
  label,
  isSet,
  value,
  onChangeText,
  onClear,
  clearing,
}: {
  label: string;
  isSet: boolean;
  value: string;
  onChangeText: (v: string) => void;
  onClear: () => void;
  clearing?: boolean;
}) {
  const { t } = useTranslation();
  const [replacing, setReplacing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const showInput = !isSet || replacing;

  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      {isSet ? (
        <View
          style={styles.chip}
          accessibilityLabel={`${label}: ${t('settings.configured')}`}
        >
          <Text variant="label">✓ {t('settings.configured')}</Text>
        </View>
      ) : null}
      {showInput ? (
        <Field
          label={isSet ? t('settings.newValue', { name: label }) : label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
        />
      ) : null}
      {isSet ? (
        confirming ? (
          <>
            <Text>{t('settings.confirmClear', { name: label })}</Text>
            <Button
              title={t('settings.yesClear')}
              loading={clearing}
              onPress={() => {
                setConfirming(false);
                setReplacing(false);
                onClear();
              }}
            />
            <Button
              title={t('common.cancel')}
              kind="secondary"
              onPress={() => setConfirming(false)}
            />
          </>
        ) : (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button
                title={replacing ? t('common.cancel') : t('settings.replace')}
                kind="secondary"
                onPress={() => {
                  setReplacing(!replacing);
                  onChangeText('');
                }}
              />
            </View>
            <View style={styles.flex}>
              <Button
                title={t('settings.clear')}
                kind="secondary"
                onPress={() => setConfirming(true)}
              />
            </View>
          </View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});

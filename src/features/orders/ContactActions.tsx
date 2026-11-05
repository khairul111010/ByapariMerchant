import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui';
import { spacing } from '../../ui/theme';
import { telUrl, whatsappUrl } from './contact';

/** Call and WhatsApp buttons for a phone number. */
export function ContactActions({ phone }: { phone: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Button
          title={t('orders.call')}
          kind="secondary"
          onPress={() => void Linking.openURL(telUrl(phone))}
        />
      </View>
      <View style={styles.flex}>
        <Button
          title={t('orders.whatsapp')}
          kind="secondary"
          onPress={() => void Linking.openURL(whatsappUrl(phone))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});

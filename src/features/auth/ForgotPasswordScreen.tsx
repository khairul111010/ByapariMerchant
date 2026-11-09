import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { KV_KEYS, kv } from '../../storage/mmkv';
import { BrandLogo } from '../../ui/Brand';
import { Button, Field, Text } from '../../ui';
import { spacing } from '../../ui/theme';
import { forgotPassword } from './api';
import { useHardwareBack } from '../../ui/useHardwareBack';

export function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  useHardwareBack(onBack);
  const { t } = useTranslation();
  const [shop, setShop] = useState(kv.getString(KV_KEYS.shopAddress) ?? '');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  const send = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await forgotPassword(shop.trim(), email.trim());
      setMessage({ text: t('forgot.sent'), ok: true });
    } catch (e) {
      setMessage({ text: errorMessage(e, t), ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logo}>
        <BrandLogo height={36} />
      </View>
      <Text variant="title">{t('forgot.title')}</Text>
      <Text variant="muted">{t('forgot.body')}</Text>
      <Text variant="muted">{t('forgot.phoneOnly')}</Text>
      <Field
        label={t('login.shopAddress')}
        suffix={t('login.shopAddressSuffix')}
        value={shop}
        onChangeText={setShop}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Field
        label={t('login.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {message ? (
        <Text variant={message.ok ? 'body' : 'error'}>{message.text}</Text>
      ) : null}
      <Button
        title={t('forgot.send')}
        onPress={send}
        loading={busy}
        disabled={!shop || !email}
      />
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'flex-start', marginBottom: spacing.sm },
  wrap: {
    padding: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
    justifyContent: 'center',
  },
});

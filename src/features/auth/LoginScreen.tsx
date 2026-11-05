import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { queryClient } from '../../app/queryClient';
import { useSession } from '../../store/session';
import { KV_KEYS, kv } from '../../storage/mmkv';
import { storeApiBaseUrl } from '../../config';
import { BrandLogo } from '../../ui/Brand';
import { Button, Field, Text } from '../../ui';
import { spacing } from '../../ui/theme';
import { login } from './api';
import { parseLoginId } from './contact';
import { ME_KEY } from './useMe';

const SHOP_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

export function LoginScreen({
  onForgot,
  onSignup,
}: {
  onForgot: () => void;
  onSignup: () => void;
}) {
  const { t } = useTranslation();
  const signIn = useSession(s => s.signIn);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z.object({
    shop: z.string().trim().regex(SHOP_RE, t('login.invalidShop')),
    login: z
      .string()
      .trim()
      .refine(v => parseLoginId(v) !== null, t('login.identifierInvalid')),
    password: z.string().min(1, t('login.passwordRequired')),
  });
  type Form = z.infer<typeof schema>;

  const { control, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      shop: kv.getString(KV_KEYS.shopAddress) ?? '',
      login: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(
    async ({ shop, login: loginInput, password }) => {
      setFormError(null);
      try {
        // Validated above, so this is an email or a normalised phone.
        const id = parseLoginId(loginInput);
        const res = await login(
          shop,
          id ? id.value : loginInput.trim(),
          password,
        );
        // Server is authoritative for the store host; fall back to the one we computed.
        const base = res.store.api_base_url.startsWith('https://')
          ? res.store.api_base_url
          : storeApiBaseUrl(shop);
        kv.set(KV_KEYS.shopAddress, shop.trim().toLowerCase());
        queryClient.setQueryData(ME_KEY, {
          user: res.user,
          store: res.store,
          limits: res.limits,
          platform: res.platform,
          unread_notifications: res.unread_notifications,
        });
        await signIn(res.token, base);
      } catch (e) {
        setFormError(
          e instanceof ApiError && e.kind === 'unauthenticated'
            ? t('login.wrongCredentials')
            : errorMessage(e, t),
        );
      }
    },
  );

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logo}>
        <BrandLogo height={44} />
      </View>
      <Text variant="title">{t('login.title')}</Text>
      <Controller
        control={control}
        name="shop"
        render={({ field, fieldState }) => (
          <Field
            label={t('login.shopAddress')}
            suffix={t('login.shopAddressSuffix')}
            value={field.value}
            onChangeText={field.onChange}
            autoCapitalize="none"
            autoCorrect={false}
            error={fieldState.error?.message}
          />
        )}
      />
      <Text variant="muted">{t('login.shopAddressHint')}</Text>
      <Controller
        control={control}
        name="login"
        render={({ field, fieldState }) => (
          <Field
            label={t('login.identifier')}
            value={field.value}
            onChangeText={field.onChange}
            autoCapitalize="none"
            autoCorrect={false}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Field
            label={t('login.password')}
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry
            autoCapitalize="none"
            error={fieldState.error?.message}
          />
        )}
      />
      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('login.signIn')}
        onPress={onSubmit}
        loading={formState.isSubmitting}
      />
      <Button title={t('login.forgot')} kind="secondary" onPress={onForgot} />
      <Button
        title={t('signup.createShop')}
        kind="secondary"
        onPress={onSignup}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'flex-start', marginBottom: spacing.lg },
  wrap: {
    padding: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
    justifyContent: 'center',
  },
});

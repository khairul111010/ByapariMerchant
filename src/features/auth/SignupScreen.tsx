import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { queryClient } from '../../app/queryClient';
import { storeApiBaseUrl } from '../../config';
import { formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { KV_KEYS, kv } from '../../storage/mmkv';
import { useSession } from '../../store/session';
import { BrandLogo } from '../../ui/Brand';
import { Button, Choice, Field, Text } from '../../ui';
import { spacing } from '../../ui/theme';
import { checkSubdomain, fetchSignupOptions, signup } from './signupApi';
import {
  makeSignupSchema,
  SHOP_RE,
  SignupForm,
  STEP_FIELDS,
  toSignupPayload,
} from './signupSchema';
import { ME_KEY } from './useMe';

type Availability = 'idle' | 'checking' | 'ok' | 'taken' | 'error';

export function SignupScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const signIn = useSession(s => s.signIn);
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability>('idle');
  const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);

  const options = useQuery({
    queryKey: ['signup-options'],
    queryFn: fetchSignupOptions,
  });

  const { control, handleSubmit, trigger, watch, setError, formState } =
    useForm<SignupForm>({
      resolver: zodResolver(makeSignupSchema(t)),
      defaultValues: {
        plan: '',
        store_name: '',
        subdomain: '',
        category: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        owner_password: '',
        owner_password_confirmation: '',
        whatsapp_number: '',
      },
    });

  const subdomain = watch('subdomain').trim();

  // Live availability check, debounced, with the previous request cancelled.
  useEffect(() => {
    if (!SHOP_RE.test(subdomain)) {
      setAvailability('idle');
      setAvailabilityMsg(null);
      return;
    }
    setAvailability('checking');
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const r = await checkSubdomain(subdomain.toLowerCase(), ctrl.signal);
        setAvailability(r.available ? 'ok' : 'taken');
        setAvailabilityMsg(r.available ? null : r.message ?? null);
      } catch (e) {
        if (!ctrl.signal.aborted) {
          setAvailability('error');
          setAvailabilityMsg(errorMessage(e, t));
        }
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [subdomain, t]);

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok && step === 1 && availability !== 'ok') {
      return; // address must be confirmed available before moving on
    }
    if (ok) {
      setStep(step + 1);
    }
  };

  const submit = handleSubmit(async values => {
    setFormError(null);
    try {
      const res = await signup(toSignupPayload(values));
      const base = res.store.api_base_url.startsWith('https://')
        ? res.store.api_base_url
        : storeApiBaseUrl(values.subdomain);
      kv.set(KV_KEYS.shopAddress, values.subdomain.trim().toLowerCase());
      queryClient.setQueryData(ME_KEY, {
        user: res.user,
        store: res.store,
        limits: res.limits,
        platform: res.platform,
        unread_notifications: res.unread_notifications,
      });
      await signIn(res.token, base);
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        // Put each server message on its field and jump to the earliest step that has one.
        let earliest = STEP_FIELDS.length;
        for (const [field, messages] of Object.entries(e.fieldErrors)) {
          const stepIdx = STEP_FIELDS.findIndex(f =>
            f.includes(field as keyof SignupForm),
          );
          if (stepIdx >= 0) {
            setError(field as keyof SignupForm, { message: messages[0] });
            earliest = Math.min(earliest, stepIdx);
          }
        }
        if (earliest < STEP_FIELDS.length) {
          setStep(earliest);
          return;
        }
      }
      setFormError(errorMessage(e, t));
    }
  });

  const plans = options.data?.plans ?? [];
  const categories = options.data?.categories ?? [];

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logo}>
        <BrandLogo height={36} />
      </View>
      <Text variant="title">{t('signup.title')}</Text>
      <Text variant="muted">
        {t('signup.step', {
          current: formatNumber(step + 1, lang),
          total: formatNumber(3, lang),
        })}
      </Text>

      {step === 0 && (
        <View style={styles.group}>
          <Text variant="label">{t('signup.plans')}</Text>
          {options.isPending ? (
            <Text variant="muted">{t('common.loading')}</Text>
          ) : null}
          {options.isError ? (
            <>
              <Text variant="error">{t('signup.optionsFailed')}</Text>
              <Button
                title={t('common.retry')}
                kind="secondary"
                onPress={() => void options.refetch()}
              />
            </>
          ) : null}
          <Controller
            control={control}
            name="plan"
            render={({ field, fieldState }) => (
              <View style={styles.group}>
                {plans.map(p => (
                  <Choice
                    key={p.key}
                    label={p.label}
                    selected={field.value === p.key}
                    onPress={() => field.onChange(p.key)}
                  >
                    <Text variant="label">{p.label}</Text>
                    {p.blurb ? <Text variant="muted">{p.blurb}</Text> : null}
                    <Text>
                      {t('signup.perMonth', {
                        amount: formatMoney(
                          String(p.price_monthly_quote),
                          lang,
                        ),
                      })}
                    </Text>
                    <Text variant="muted">
                      {p.staff_accounts === null
                        ? t('signup.staffUnlimited')
                        : t('signup.staffCount', {
                            count: formatNumber(p.staff_accounts, lang),
                          })}
                    </Text>
                    {p.custom_domain_included ? (
                      <Text variant="muted">
                        {t('signup.customDomainIncluded')}
                      </Text>
                    ) : null}
                  </Choice>
                ))}
                {fieldState.error ? (
                  <Text variant="error">{fieldState.error.message}</Text>
                ) : null}
              </View>
            )}
          />
        </View>
      )}

      {step === 1 && (
        <View style={styles.group}>
          <Text variant="label">{t('signup.shopDetails')}</Text>
          <Controller
            control={control}
            name="store_name"
            render={({ field, fieldState }) => (
              <Field
                label={t('signup.storeName')}
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="subdomain"
            render={({ field, fieldState }) => (
              <Field
                label={t('login.shopAddress')}
                suffix={t('login.shopAddressSuffix')}
                value={field.value}
                onChangeText={v => field.onChange(v.toLowerCase())}
                autoCapitalize="none"
                autoCorrect={false}
                error={fieldState.error?.message}
              />
            )}
          />
          {availability === 'checking' ? (
            <Text variant="muted">{t('signup.checking')}</Text>
          ) : null}
          {availability === 'ok' ? <Text>{t('signup.available')}</Text> : null}
          {availability === 'taken' ? (
            <Text variant="error">{availabilityMsg ?? t('signup.taken')}</Text>
          ) : null}
          {availability === 'error' ? (
            <Text variant="error">{availabilityMsg}</Text>
          ) : null}
          <Text variant="label">{t('signup.category')}</Text>
          <Controller
            control={control}
            name="category"
            render={({ field, fieldState }) => (
              <View style={styles.group}>
                {categories.map(c => (
                  <Choice
                    key={c.key}
                    label={c.label}
                    selected={field.value === c.key}
                    onPress={() => field.onChange(c.key)}
                  >
                    <Text>{c.label}</Text>
                  </Choice>
                ))}
                {fieldState.error ? (
                  <Text variant="error">{fieldState.error.message}</Text>
                ) : null}
              </View>
            )}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.group}>
          <Text variant="label">{t('signup.ownerDetails')}</Text>
          <Controller
            control={control}
            name="owner_name"
            render={({ field, fieldState }) => (
              <Field
                label={t('signup.ownerName')}
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="owner_email"
            render={({ field, fieldState }) => (
              <Field
                label={t('signup.emailOptional')}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="owner_phone"
            render={({ field, fieldState }) => (
              <Field
                label={t('signup.phone')}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="phone-pad"
                error={fieldState.error?.message}
              />
            )}
          />
          <Text variant="muted">{t('signup.contactHint')}</Text>
          <Controller
            control={control}
            name="owner_password"
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
          <Controller
            control={control}
            name="owner_password_confirmation"
            render={({ field, fieldState }) => (
              <Field
                label={t('signup.confirmPassword')}
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                autoCapitalize="none"
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="whatsapp_number"
            render={({ field, fieldState }) => (
              <Field
                label={t('signup.whatsapp')}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="phone-pad"
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
      )}

      {formError ? <Text variant="error">{formError}</Text> : null}

      {step < 2 ? (
        <Button
          title={t('signup.next')}
          onPress={next}
          disabled={step === 1 && availability === 'checking'}
        />
      ) : (
        <Button
          title={t('signup.create')}
          onPress={submit}
          loading={formState.isSubmitting}
        />
      )}
      {step > 0 ? (
        <Button
          title={t('common.back')}
          kind="secondary"
          onPress={() => setStep(step - 1)}
        />
      ) : null}
      <Button
        title={t('signup.haveAccount')}
        kind="secondary"
        onPress={onBackToLogin}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'flex-start', marginBottom: spacing.sm },
  wrap: { padding: spacing.xl, gap: spacing.md, flexGrow: 1 },
  group: { gap: spacing.md },
});

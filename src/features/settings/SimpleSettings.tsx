import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import {
  AI_PROVIDERS,
  AiSettings,
  GeneralSettings,
  MarketingSettings,
  PaymentSettings,
} from '../../api/schemas/settings';
import { Button, Choice, Field, Text } from '../../ui';
import { colors, spacing } from '../../ui/theme';
import { normalizeWhatsapp } from '../auth/signupSchema';
import { useAi, useGeneral, useMarketing, usePayments } from './hooks';
import { changedFields, clearPatch, isEmptyPatch, withSecret } from './patch';
import { SecretField } from './SecretField';
import { SettingsPage } from './SettingsPage';

type Save = UseMutationResult<unknown, Error, Record<string, unknown>>;

/** Save button + result line shared by every group. Server field errors are shown on their field. */
function useSaver(save: Save) {
  const { t } = useTranslation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);

  const run = (patch: Record<string, unknown>) => {
    setNote(null);
    setFieldErrors({});
    if (isEmptyPatch(patch)) {
      setNote({ text: t('settings.nothingToSave'), ok: true });
      return;
    }
    save.mutate(patch, {
      onSuccess: () => setNote({ text: t('settings.saved'), ok: true }),
      onError: e => {
        if (
          e instanceof ApiError &&
          e.kind === 'validation' &&
          Object.keys(e.fieldErrors).length > 0
        ) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(e.fieldErrors).map(([k, v]) => [k, v[0]]),
            ),
          );
        } else {
          setNote({ text: errorMessage(e, t), ok: false });
        }
      },
    });
  };
  const noteView = note ? (
    <Text variant={note.ok ? 'body' : 'error'}>{note.text}</Text>
  ) : null;
  return { run, fieldErrors, noteView };
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.switch}>
      <Text style={styles.flex}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary }}
      />
    </View>
  );
}

/* ---------------- Shop details ---------------- */
function GeneralForm({ data, save }: { data: GeneralSettings; save: Save }) {
  const { t } = useTranslation();
  const { run, fieldErrors, noteView } = useSaver(save);
  const [whatsapp, setWhatsapp] = useState(data.whatsapp_number ?? '');
  const [reviews, setReviews] = useState(data.reviews_enabled);
  const [credit, setCredit] = useState(data.show_platform_credit);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = () => {
    setLocalError(null);
    const wa = normalizeWhatsapp(whatsapp);
    if (wa && !/^01\d{9}$/.test(wa)) {
      setLocalError(t('signup.whatsappInvalid'));
      return;
    }
    const patch: Record<string, unknown> = {
      ...changedFields(
        { whatsapp_number: data.whatsapp_number ?? '' },
        { whatsapp_number: wa },
      ),
    };
    if (reviews !== data.reviews_enabled) {
      patch.reviews_enabled = reviews;
    }
    if (credit !== data.show_platform_credit) {
      patch.show_platform_credit = credit;
    }
    run(patch);
  };
  return (
    <>
      <Field
        label={t('settings.shopName')}
        value={data.name}
        editable={false}
      />
      <Field
        label={t('settings.shopAddress')}
        value={data.subdomain}
        editable={false}
      />
      <Field
        label={t('settings.whatsapp')}
        value={whatsapp}
        onChangeText={setWhatsapp}
        keyboardType="phone-pad"
        error={localError ?? fieldErrors.whatsapp_number}
      />
      <ToggleRow
        label={t('settings.reviewsEnabled')}
        value={reviews}
        onChange={setReviews}
      />
      <ToggleRow
        label={t('settings.platformCredit')}
        value={credit}
        onChange={setCredit}
      />
      {noteView}
      <Button
        title={t('settings.save')}
        onPress={submit}
        loading={save.isPending}
      />
    </>
  );
}
export function GeneralSettingsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { query, save } = useGeneral();
  return (
    <SettingsPage title={t('settings.general')} onBack={onBack} query={query}>
      {d => <GeneralForm data={d} save={save as Save} />}
    </SettingsPage>
  );
}

/* ---------------- Payments ---------------- */
function PaymentsForm({ data, save }: { data: PaymentSettings; save: Save }) {
  const { t } = useTranslation();
  const { run, fieldErrors, noteView } = useSaver(save);
  const [sslId, setSslId] = useState(data.sslcommerz_store_id ?? '');
  const [bkash, setBkash] = useState(data.bkash_number ?? '');
  const [nagad, setNagad] = useState(data.nagad_number ?? '');
  const [password, setPassword] = useState('');

  const submit = () => {
    const original = {
      sslcommerz_store_id: data.sslcommerz_store_id ?? '',
      bkash_number: data.bkash_number ?? '',
      nagad_number: data.nagad_number ?? '',
    };
    const edited = {
      sslcommerz_store_id: sslId,
      bkash_number: bkash,
      nagad_number: nagad,
    };
    run(
      withSecret(
        changedFields(original, edited),
        'sslcommerz_store_password',
        password,
      ),
    );
    setPassword('');
  };
  return (
    <>
      <Text variant="muted">
        {t('settings.methodsNow')}:{' '}
        {data.available_payment_methods
          .map(m =>
            t(`orders.payment.${m === 'cod' ? 'cod' : m}`, { defaultValue: m }),
          )
          .join(', ')}
      </Text>
      <Field
        label={t('settings.bkash')}
        value={bkash}
        onChangeText={setBkash}
        keyboardType="phone-pad"
        error={fieldErrors.bkash_number}
      />
      <Field
        label={t('settings.nagad')}
        value={nagad}
        onChangeText={setNagad}
        keyboardType="phone-pad"
        error={fieldErrors.nagad_number}
      />
      <Field
        label={t('settings.sslId')}
        value={sslId}
        onChangeText={setSslId}
        autoCapitalize="none"
        autoCorrect={false}
        error={fieldErrors.sslcommerz_store_id}
      />
      <SecretField
        label={t('settings.sslPassword')}
        isSet={data.sslcommerz_store_password_set}
        value={password}
        onChangeText={setPassword}
        clearing={save.isPending}
        onClear={() => run(clearPatch('sslcommerz_store_password'))}
      />
      {fieldErrors.sslcommerz_store_password ? (
        <Text variant="error">{fieldErrors.sslcommerz_store_password}</Text>
      ) : null}
      {noteView}
      <Button
        title={t('settings.save')}
        onPress={submit}
        loading={save.isPending}
      />
    </>
  );
}
export function PaymentsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { query, save } = usePayments();
  return (
    <SettingsPage title={t('settings.payments')} onBack={onBack} query={query}>
      {d => <PaymentsForm data={d} save={save as Save} />}
    </SettingsPage>
  );
}

/* ---------------- AI ---------------- */
function AiForm({ data, save }: { data: AiSettings; save: Save }) {
  const { t } = useTranslation();
  const { run, fieldErrors, noteView } = useSaver(save);
  const [provider, setProvider] = useState<string | null>(data.ai_provider);
  const [key, setKey] = useState('');

  const submit = () => {
    const patch: Record<string, unknown> = {};
    if (provider && provider !== data.ai_provider) {
      patch.ai_provider = provider;
    }
    run(withSecret(patch, 'ai_api_key', key));
    setKey('');
  };
  return (
    <>
      <Text variant="muted">{t('settings.aiNote')}</Text>
      <Text variant="label">{t('settings.aiProvider')}</Text>
      {AI_PROVIDERS.map(p => (
        <Choice
          key={p}
          label={p}
          selected={provider === p}
          onPress={() => setProvider(p)}
        >
          <Text>{p === 'anthropic' ? 'Anthropic (Claude)' : 'OpenAI'}</Text>
        </Choice>
      ))}
      {fieldErrors.ai_provider ? (
        <Text variant="error">{fieldErrors.ai_provider}</Text>
      ) : null}
      <SecretField
        label={t('settings.aiKey')}
        isSet={data.ai_api_key_set}
        value={key}
        onChangeText={setKey}
        clearing={save.isPending}
        onClear={() => run(clearPatch('ai_api_key'))}
      />
      {fieldErrors.ai_api_key ? (
        <Text variant="error">{fieldErrors.ai_api_key}</Text>
      ) : null}
      {noteView}
      <Button
        title={t('settings.save')}
        onPress={submit}
        loading={save.isPending}
      />
    </>
  );
}
export function AiScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { query, save } = useAi();
  return (
    <SettingsPage title={t('settings.ai')} onBack={onBack} query={query}>
      {d => <AiForm data={d} save={save as Save} />}
    </SettingsPage>
  );
}

/* ---------------- Marketing ---------------- */
const MARKETING_TEXT = [
  'facebook_pixel_id',
  'ga4_measurement_id',
  'gtm_container_id',
  'tiktok_pixel_id',
  'meta_title',
  'meta_description',
  'google_site_verification',
] as const;

function MarketingForm({
  data,
  save,
}: {
  data: MarketingSettings;
  save: Save;
}) {
  const { t } = useTranslation();
  const { run, fieldErrors, noteView } = useSaver(save);
  const initial = Object.fromEntries(
    MARKETING_TEXT.map(k => [k, data[k] ?? '']),
  ) as Record<(typeof MARKETING_TEXT)[number], string>;
  const [v, setV] = useState(initial);
  const [capi, setCapi] = useState('');
  const [localError, setLocalError] = useState<{
    title?: string;
    description?: string;
  }>({});

  const submit = () => {
    const errs: typeof localError = {};
    if (v.meta_title.trim().length > 70) {
      errs.title = t('settings.tooLong');
    }
    if (v.meta_description.trim().length > 300) {
      errs.description = t('settings.tooLong');
    }
    setLocalError(errs);
    if (errs.title || errs.description) {
      return;
    }
    run(
      withSecret(
        changedFields(initial, v),
        'facebook_conversions_api_token',
        capi,
      ),
    );
    setCapi('');
  };
  const text = (
    k: (typeof MARKETING_TEXT)[number],
    label: string,
    extra?: object,
  ) => (
    <Field
      label={label}
      value={v[k]}
      onChangeText={x => setV(s => ({ ...s, [k]: x }))}
      autoCapitalize="none"
      autoCorrect={false}
      error={fieldErrors[k]}
      {...extra}
    />
  );
  return (
    <>
      {text('facebook_pixel_id', t('settings.pixel'))}
      <SecretField
        label={t('settings.capi')}
        isSet={data.facebook_conversions_api_configured}
        value={capi}
        onChangeText={setCapi}
        clearing={save.isPending}
        onClear={() => run(clearPatch('facebook_conversions_api_token'))}
      />
      {text('ga4_measurement_id', t('settings.ga4'))}
      {text('gtm_container_id', t('settings.gtm'))}
      {text('tiktok_pixel_id', t('settings.tiktok'))}
      {text('meta_title', t('settings.metaTitle'), {
        autoCapitalize: 'sentences',
        error: localError.title ?? fieldErrors.meta_title,
      })}
      {text('meta_description', t('settings.metaDescription'), {
        autoCapitalize: 'sentences',
        multiline: true,
        error: localError.description ?? fieldErrors.meta_description,
      })}
      {text('google_site_verification', t('settings.siteVerification'), {
        multiline: true,
      })}
      <Text variant="muted">{t('settings.siteVerificationHint')}</Text>
      {noteView}
      <Button
        title={t('settings.save')}
        onPress={submit}
        loading={save.isPending}
      />
    </>
  );
}
export function MarketingScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { query, save } = useMarketing();
  return (
    <SettingsPage title={t('settings.marketing')} onBack={onBack} query={query}>
      {d => <MarketingForm data={d} save={save as Save} />}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  flex: { flex: 1 },
});

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { ApiError } from '../../api/errors';
import { COUPON_TYPES, Coupon } from '../../api/schemas/selling';
import { formatDate, formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Choice, Field, Skeleton, Text } from '../../ui';
import { DateField } from '../../ui/DateField';
import { colors, spacing, cardStyle } from '../../ui/theme';
import {
  CouponForm,
  isoToDateInput,
  makeCouponSchema,
  toCouponPayload,
} from './couponForm';
import { useCouponMutations, useCoupons } from './hooks';

function CouponFormView({
  coupon,
  onDone,
  onBack,
}: {
  coupon: Coupon | null;
  onDone: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const m = useCouponMutations();
  const schema = useMemo(() => makeCouponSchema(t), [t]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { control, handleSubmit, setError, watch, formState } =
    useForm<CouponForm>({
      resolver: zodResolver(schema) as never,
      defaultValues: {
        code: coupon?.code ?? '',
        type: coupon?.type ?? 'percentage',
        value: coupon?.value ? coupon.value.replace(/\.00$/, '') : '',
        min_order_amount: coupon?.min_order_amount
          ? coupon.min_order_amount.replace(/\.00$/, '')
          : '',
        max_uses: coupon?.max_uses?.toString() ?? '',
        starts_at: isoToDateInput(coupon?.starts_at),
        expires_at: isoToDateInput(coupon?.expires_at),
        is_active: coupon?.is_active ?? true,
      },
    });
  const type = watch('type');

  const submit = handleSubmit(async v => {
    setFormError(null);
    try {
      const body = toCouponPayload(v);
      if (coupon) {
        await m.update.mutateAsync({ id: coupon.id, body });
      } else {
        await m.create.mutateAsync(body);
      }
      onDone();
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        let shown = false;
        for (const [field, messages] of Object.entries(e.fieldErrors)) {
          if (field in v) {
            // The server's own message (for example "code has already been taken") goes on its field.
            setError(field as keyof CouponForm, { message: messages[0] });
            shown = true;
          }
        }
        if (shown) {
          return;
        }
      }
      setFormError(errorMessage(e, t));
    }
  });

  const field = (
    name:
      | 'code'
      | 'value'
      | 'min_order_amount'
      | 'max_uses'
      | 'starts_at'
      | 'expires_at',
    label: string,
    extra?: object,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: f, fieldState }) => (
        <Field
          label={label}
          value={f.value}
          onChangeText={f.onChange}
          error={fieldState.error?.message}
          {...extra}
        />
      )}
    />
  );

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">
        {coupon ? t('coupons.edit') : t('coupons.add')}
      </Text>
      {field('code', t('coupons.code'), { autoCapitalize: 'characters' })}
      <Text variant="label">{t('coupons.type')}</Text>
      <Controller
        control={control}
        name="type"
        render={({ field: f }) => (
          <View style={styles.group}>
            {COUPON_TYPES.map(ty => (
              <Choice
                key={ty}
                label={t(`coupons.${ty}`)}
                selected={f.value === ty}
                onPress={() => f.onChange(ty)}
              >
                <Text>{t(`coupons.${ty}`)}</Text>
              </Choice>
            ))}
          </View>
        )}
      />
      {type !== 'free_delivery'
        ? field(
            'value',
            type === 'percentage'
              ? t('coupons.percentValue')
              : t('coupons.value'),
            { keyboardType: 'decimal-pad' },
          )
        : null}
      {field('min_order_amount', t('coupons.minOrder'), {
        keyboardType: 'decimal-pad',
      })}
      {field('max_uses', t('coupons.maxUses'), { keyboardType: 'number-pad' })}
      {(['starts_at', 'expires_at'] as const).map(name => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field: f, fieldState }) => (
            <DateField
              label={t(
                name === 'starts_at' ? 'coupons.startsAt' : 'coupons.expiresAt',
              )}
              value={f.value}
              onChange={f.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      ))}
      <Controller
        control={control}
        name="is_active"
        render={({ field: f }) => (
          <View style={styles.switch}>
            <Text style={styles.flex}>{t('coupons.active')}</Text>
            <Switch
              value={f.value}
              onValueChange={f.onChange}
              trackColor={{ true: colors.primary }}
            />
          </View>
        )}
      />
      {formError ? <Text variant="error">{formError}</Text> : null}
      <Button
        title={t('coupons.save')}
        onPress={submit}
        loading={formState.isSubmitting}
      />
      {coupon ? (
        confirming ? (
          <>
            <Text>{t('coupons.confirmDelete', { code: coupon.code })}</Text>
            <Button
              title={t('coupons.yesDelete')}
              loading={m.remove.isPending}
              onPress={() => m.remove.mutate(coupon.id, { onSuccess: onDone })}
            />
            <Button
              title={t('common.cancel')}
              kind="secondary"
              onPress={() => setConfirming(false)}
            />
            {m.remove.error ? (
              <Text variant="error">{errorMessage(m.remove.error, t)}</Text>
            ) : null}
          </>
        ) : (
          <Button
            title={t('coupons.delete')}
            kind="secondary"
            onPress={() => setConfirming(true)}
          />
        )
      ) : null}
    </ScrollView>
  );
}

export function CouponsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const coupons = useCoupons();
  const rows = useMemo(
    () => coupons.data?.pages.flatMap(p => p.data) ?? [],
    [coupons.data],
  );
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);

  if (editing) {
    return (
      <CouponFormView
        coupon={editing === 'new' ? null : editing}
        onDone={() => setEditing(null)}
        onBack={() => setEditing(null)}
      />
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('coupons.title')}</Text>
      <Button title={t('coupons.add')} onPress={() => setEditing('new')} />
      {coupons.isPending ? (
        <Skeleton height={80} />
      ) : coupons.isError && rows.length === 0 ? (
        <>
          <Text variant="error">{errorMessage(coupons.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void coupons.refetch()}
          />
        </>
      ) : rows.length === 0 ? (
        <Text variant="muted">{t('coupons.empty')}</Text>
      ) : (
        rows.map(c => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            onPress={() => setEditing(c)}
            style={styles.card}
          >
            <View style={styles.line}>
              <Text variant="label">{c.code}</Text>
              <Text variant="muted">
                {c.is_active ? t('coupons.active') : t('coupons.inactive')}
              </Text>
            </View>
            <Text>
              {c.type === 'percentage'
                ? `${formatNumber(c.value?.replace(/\.00$/, '') ?? '', lang)}%`
                : c.type === 'fixed'
                ? formatMoney(c.value, lang)
                : t('coupons.free_delivery')}
              {c.min_order_amount
                ? ` · ${t('coupons.minOrder').split(' (')[0]} ${formatMoney(
                    c.min_order_amount,
                    lang,
                  )}`
                : ''}
            </Text>
            <Text variant="muted">
              {c.max_uses !== null
                ? t('coupons.usedOf', {
                    count: formatNumber(c.used_count, lang),
                    max: formatNumber(c.max_uses, lang),
                  })
                : t('coupons.used', {
                    count: formatNumber(c.used_count, lang),
                  })}
              {c.expires_at
                ? ` · ${t('coupons.expires', {
                    date: formatDate(c.expires_at, lang),
                  })}`
                : ''}
            </Text>
          </Pressable>
        ))
      )}
      {coupons.hasNextPage ? (
        <Button
          title={t('common.retry')}
          kind="secondary"
          loading={coupons.isFetchingNextPage}
          onPress={() => void coupons.fetchNextPage()}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  group: { gap: spacing.sm },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  flex: { flex: 1 },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: 2,
    minHeight: 56,
  },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
});

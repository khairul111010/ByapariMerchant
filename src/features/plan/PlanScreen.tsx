import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Button, Skeleton, Text } from '../../ui';
import { colors, radius, spacing, cardStyle } from '../../ui/theme';
import { errorMessage } from '../../api/errorMessage';
import { usePlan } from './hooks';
import { priceString, renewalState } from './logic';

const open = (url: string | null) =>
  url ? void Linking.openURL(url) : undefined;

export function PlanScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const plan = usePlan();
  const d = plan.data;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Button title={t('common.back')} kind="secondary" onPress={onBack} />
      <Text variant="title">{t('plan.title')}</Text>
      {plan.isPending ? (
        <>
          <Skeleton height={100} />
          <Skeleton height={100} />
        </>
      ) : plan.isError || !d ? (
        <>
          <Text variant="error">{errorMessage(plan.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void plan.refetch()}
          />
        </>
      ) : (
        <>
          <View style={[styles.card, styles.current]}>
            <Text variant="label">{d.plan.label}</Text>
            {d.plan.blurb ? <Text variant="muted">{d.plan.blurb}</Text> : null}
            <Text>
              {t('plan.perMonth', {
                amount: formatMoney(
                  priceString(d.plan.price_monthly_quote),
                  lang,
                ),
              })}
            </Text>
          </View>

          {renewalState(d.renewal) === 'none' ? (
            <Text variant="muted">{t('plan.renewalNone')}</Text>
          ) : renewalState(d.renewal) === 'overdue' ? (
            <Text style={styles.alert}>{t('plan.overdue')}</Text>
          ) : (
            <Text>
              {t('plan.renewsOn', {
                date: formatDate(d.renewal.expires_at, lang),
                days: formatNumber(d.renewal.days_left ?? 0, lang),
              })}
            </Text>
          )}
          {d.renew_whatsapp_url ? (
            <Button
              title={t('plan.renew')}
              kind={
                renewalState(d.renewal) === 'overdue' ? 'primary' : 'secondary'
              }
              onPress={() => open(d.renew_whatsapp_url)}
            />
          ) : null}

          <Text variant="label">{t('plan.usage')}</Text>
          <View style={styles.card}>
            <Text>
              {d.usage.staff_accounts.max === null
                ? t('plan.staffUnlimited', {
                    used: formatNumber(d.usage.staff_accounts.used, lang),
                  })
                : t('plan.staffSeats', {
                    used: formatNumber(d.usage.staff_accounts.used, lang),
                    max: formatNumber(d.usage.staff_accounts.max, lang),
                  })}
            </Text>
            <Text>
              {t('plan.couriers', {
                configured: formatNumber(
                  d.usage.courier_drivers.configured.length,
                  lang,
                ),
                enabled: formatNumber(
                  d.usage.courier_drivers.enabled.length,
                  lang,
                ),
              })}
            </Text>
            {/* Products and orders are unlimited on every plan: never show a cap. */}
            <Text>
              {t('plan.products')}: {t('plan.unlimited')}
            </Text>
            <Text>
              {t('plan.orders')}: {t('plan.unlimited')}
            </Text>
            <Text>
              {t('plan.domain')}:{' '}
              {d.custom_domain.enabled
                ? d.custom_domain.included_in_plan
                  ? t('plan.domainIncluded')
                  : t('plan.domainEnabled')
                : d.custom_domain.addon_price_yearly !== null
                ? t('plan.domainAddon', {
                    price: formatMoney(
                      priceString(d.custom_domain.addon_price_yearly),
                      lang,
                    ),
                  })
                : '—'}
            </Text>
          </View>

          <Text variant="label">{t('plan.plans')}</Text>
          {d.plans.map(p => (
            <View
              key={p.key}
              style={[styles.card, p.is_current && styles.current]}
            >
              <Text variant="label">
                {p.label}
                {p.is_current ? ` · ${t('plan.current')}` : ''}
              </Text>
              {p.blurb ? <Text variant="muted">{p.blurb}</Text> : null}
              <Text>
                {t('plan.perMonth', {
                  amount: formatMoney(priceString(p.price_monthly_quote), lang),
                })}
              </Text>
              <Text variant="muted">
                {p.staff_accounts === null
                  ? t('plan.seatsUnlimited')
                  : t('plan.seats', {
                      count: formatNumber(p.staff_accounts, lang),
                    })}{' '}
                ·{' '}
                {t('plan.drivers', {
                  count: formatNumber(p.courier_drivers.length, lang),
                })}
                {p.custom_domain_included ? ` · ${t('plan.domainIn')}` : ''}
              </Text>
              {p.is_upgrade && p.contact_whatsapp_url ? (
                <Button
                  title={t('plan.upgrade', { plan: p.label })}
                  onPress={() => open(p.contact_whatsapp_url)}
                />
              ) : null}
            </View>
          ))}
          <Text variant="muted">{t('plan.note')}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  card: {
    ...cardStyle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  current: { borderColor: colors.primary, borderWidth: 2 },
  alert: {
    backgroundColor: colors.warningBg,
    color: colors.warningText,
    padding: spacing.md,
    borderRadius: radius.md,
  },
});

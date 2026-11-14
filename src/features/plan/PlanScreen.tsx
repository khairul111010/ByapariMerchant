import React from 'react';
import { Linking, RefreshControl, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { errorMessage } from '../../api/errorMessage';
import type { HistoryRow, PlanData } from '../../api/schemas/settings';
import { formatCount, formatDate, formatMoney, Lang } from '../../i18n/format';
import { useLang } from '../../i18n';
import { Badge } from '../../ui/Badge';
import { Button, Skeleton, Text } from '../../ui';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { useStyles, useTheme } from '../../ui/ThemeProvider';
import { usePlan } from './hooks';
import {
  BarTone,
  historyAmount,
  historyPeriod,
  ordersTone,
  payAction,
  priceString,
  productsTone,
  renewalState,
  stateTone,
  usageFraction,
} from './logic';

const open = (url: string | null) =>
  url ? void Linking.openURL(url) : undefined;

/** "৳350/month, billed yearly ৳4,200" */
const priceLine = (
  p: { price_monthly_quote: number | string; price_yearly: number | string },
  t: TFunction,
  lang: Lang,
) =>
  t('plan.perMonthYearly', {
    monthly: formatMoney(priceString(p.price_monthly_quote), lang),
    yearly: formatMoney(priceString(p.price_yearly), lang),
  });

function useScreenStyles() {
  return useStyles(({ c, spacing, radius, shadow }) => ({
    screen: { flex: 1, backgroundColor: c.background },
    wrap: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
    card: {
      backgroundColor: c.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.sm,
      ...shadow.card,
    },
    current: { borderColor: c.primaryFill, borderWidth: 2 },
    headRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    barTrack: {
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: c.neutralSoft,
      overflow: 'hidden',
    },
    barFill: { height: 10, borderRadius: radius.pill },
    barHead: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
    plansRow: { gap: spacing.md, paddingRight: spacing.lg },
    planCard: { width: 260 },
    historyRow: {
      paddingVertical: spacing.sm,
      gap: 2,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    historyFirst: { borderTopWidth: 0 },
    historyHead: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
    flex: { flex: 1 },
  }));
}

function UsageBar({
  label,
  used,
  max,
  tone,
}: {
  label: string;
  used: number;
  max: number | null;
  tone: BarTone;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const { c } = useTheme();
  const s = useScreenStyles();
  const fill =
    tone === 'danger' ? c.danger : tone === 'warning' ? c.warning : c.primaryFill;
  const value =
    max === null
      ? t('plan.usedUnlimited', { used: formatCount(used, lang) })
      : t('plan.usedOf', {
          used: formatCount(used, lang),
          max: formatCount(max, lang),
        });
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{ gap: 6 }}
    >
      <View style={s.barHead}>
        <Text variant="label" style={s.flex}>
          {label}
        </Text>
        <Text
          variant="label"
          style={
            tone === 'danger'
              ? { color: c.dangerText }
              : tone === 'warning'
              ? { color: c.warningText }
              : undefined
          }
        >
          {value}
        </Text>
      </View>
      {max !== null ? (
        <View style={s.barTrack}>
          <View
            style={[
              s.barFill,
              {
                width: `${Math.round(usageFraction(used, max) * 100)}%`,
                backgroundColor: fill,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

/** The one-liner under the status badge. */
function stateLine(d: PlanData, t: TFunction, lang: Lang): string {
  switch (d.plan.state) {
    case 'trial': {
      const date = formatDate(d.plan.trial_ends_at, lang);
      return d.plan.trial_days_left === 0
        ? t('plan.trialLastDay', { date })
        : t('plan.trialEnds', {
            date,
            days: formatCount(d.plan.trial_days_left ?? 0, lang),
          });
    }
    case 'trial_expired':
    case 'pending':
      return t('plan.closed');
    case 'overdue':
      return t('plan.overdue');
    default:
      return renewalState(d.renewal) === 'none'
        ? t('plan.renewalNone')
        : t('plan.paidUntil', { date: formatDate(d.renewal.expires_at, lang) });
  }
}

function HistoryItem({ row, first }: { row: HistoryRow; first: boolean }) {
  const { t } = useTranslation();
  const lang = useLang();
  const s = useScreenStyles();
  const amount = historyAmount(row.amount);
  const period = historyPeriod(row);
  return (
    <View style={[s.historyRow, first && s.historyFirst]}>
      <View style={s.historyHead}>
        <Text variant="label" style={s.flex}>
          {row.label}
        </Text>
        <Text variant="label">
          {amount.kind === 'free'
            ? t('plan.free')
            : amount.kind === 'none'
            ? '—'
            : formatMoney(amount.value, lang)}
        </Text>
      </View>
      <Text variant="muted">{formatDate(row.date, lang)}</Text>
      {period ? (
        <Text variant="muted">
          {period.kind === 'until'
            ? t('plan.until', { date: formatDate(period.to, lang) })
            : t('plan.range', {
                from: formatDate(period.from, lang),
                to: formatDate(period.to, lang),
              })}
        </Text>
      ) : null}
      {row.payment_reference ? (
        <Text variant="muted">{t('plan.ref', { ref: row.payment_reference })}</Text>
      ) : null}
    </View>
  );
}

/**
 * Subscription (owner only; `/plan` is 403 for staff and the entry is hidden for them).
 * Read-only: paying, renewing and changing plan all open a prefilled WhatsApp message.
 * There is never a payment form or payment details here.
 */
export function PlanScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { c } = useTheme();
  const s = useScreenStyles();
  const plan = usePlan();
  const d = plan.data;

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.wrap}
      refreshControl={
        <RefreshControl
          refreshing={plan.isRefetching}
          onRefresh={() => void plan.refetch()}
          colors={[c.primary]}
          tintColor={c.primary}
        />
      }
    >
      <ScreenHeader title={t('plan.title')} onBack={onBack} />
      {plan.isPending ? (
        <>
          <Skeleton height={120} />
          <Skeleton height={160} />
          <Skeleton height={120} />
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
          {/* Header: plan, status, what it means, and the one WhatsApp action. */}
          <View style={[s.card, s.current]}>
            <View style={s.headRow}>
              <Text variant="subtitle">{d.plan.label}</Text>
              <Badge
                label={t(`plan.state.${d.plan.state}`, {
                  defaultValue: d.plan.state,
                })}
                tone={stateTone(d.plan.state)}
              />
            </View>
            <Text variant="muted">{priceLine(d.plan, t, lang)}</Text>
            <Text
              style={
                stateTone(d.plan.state) === 'danger'
                  ? { color: c.dangerText }
                  : undefined
              }
            >
              {stateLine(d, t, lang)}
            </Text>
            {(() => {
              const action = payAction(d);
              return action.url ? (
                <Button
                  title={action.kind === 'renew' ? t('plan.renew') : t('plan.pay')}
                  onPress={() => open(action.url)}
                />
              ) : null;
            })()}
          </View>

          {/* Usage */}
          <Text variant="label">{t('plan.usage')}</Text>
          <View style={s.card}>
            <UsageBar
              label={t('plan.products')}
              used={d.usage.products.used}
              max={d.usage.products.max}
              tone={productsTone(d.usage.products)}
            />
            <UsageBar
              label={t('plan.ordersMonth')}
              used={d.usage.orders.used}
              max={d.usage.orders.max}
              tone={ordersTone(d.usage.orders.state)}
            />
            <UsageBar
              label={t('plan.staffAccounts')}
              used={d.usage.staff_accounts.used}
              max={d.usage.staff_accounts.max}
              tone="normal"
            />
            <Text variant="muted">{t('plan.usageNote')}</Text>
            <Text variant="muted">
              {t('plan.couriers', {
                configured: formatCount(
                  d.usage.courier_drivers.configured.length,
                  lang,
                ),
                enabled: formatCount(
                  d.usage.courier_drivers.enabled.length,
                  lang,
                ),
              })}
            </Text>
            <Text variant="muted">
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

          {/* Plans, swipeable; the current one is highlighted. */}
          <Text variant="label">{t('plan.plans')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.plansRow}
          >
            {d.plans.map(p => (
              <View
                key={p.key}
                style={[s.card, s.planCard, p.is_current && s.current]}
              >
                <View style={s.headRow}>
                  <Text variant="label">{p.label}</Text>
                  {p.is_current ? (
                    <Badge label={t('plan.current')} tone="brand" />
                  ) : null}
                </View>
                {p.blurb ? <Text variant="muted">{p.blurb}</Text> : null}
                <Text>{priceLine(p, t, lang)}</Text>
                <Text variant="muted">
                  {p.products === null
                    ? t('plan.productsUnlimited')
                    : t('plan.productsCount', {
                        count: formatCount(p.products, lang),
                      })}
                </Text>
                <Text variant="muted">
                  {p.orders_per_month === null
                    ? t('plan.ordersUnlimited')
                    : t('plan.ordersCount', {
                        count: formatCount(p.orders_per_month, lang),
                      })}
                </Text>
                <Text variant="muted">
                  {p.staff_accounts === null
                    ? t('plan.seatsUnlimited')
                    : t('plan.seats', {
                        count: formatCount(p.staff_accounts, lang),
                      })}
                </Text>
                <Text variant="muted">
                  {t('plan.drivers', {
                    count: formatCount(p.courier_drivers.length, lang),
                  })}
                </Text>
                {p.custom_domain_included ? (
                  <Text variant="muted">{t('plan.domainIn')}</Text>
                ) : null}
                {p.has_trial && p.trial_days > 0 ? (
                  <Text variant="muted">
                    {t('plan.freeTrial', {
                      count: formatCount(p.trial_days, lang),
                    })}
                  </Text>
                ) : null}
                {!p.is_current && p.contact_whatsapp_url ? (
                  <Button
                    title={t('plan.choose', { plan: p.label })}
                    kind={p.is_upgrade ? 'primary' : 'secondary'}
                    onPress={() => open(p.contact_whatsapp_url)}
                  />
                ) : null}
              </View>
            ))}
          </ScrollView>

          {/* History, newest first. */}
          <Text variant="label">{t('plan.history')}</Text>
          <View style={s.card}>
            {d.history.length === 0 ? (
              <Text variant="muted">{t('plan.historyEmpty')}</Text>
            ) : (
              d.history.map((row, i) => (
                <HistoryItem
                  key={`${row.date}-${i}`}
                  row={row}
                  first={i === 0}
                />
              ))
            )}
          </View>
          <Text variant="muted">{t('plan.note')}</Text>
        </>
      )}
    </ScrollView>
  );
}

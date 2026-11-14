import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '../../api/errorMessage';
import { Dashboard } from '../../api/schemas/storefront';
import { formatDate, formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { StoreBanner } from '../shell/StoreBanner';
import { Button, Skeleton, Text } from '../../ui';
import { DateField } from '../../ui/DateField';
import { SectionHeader } from '../../ui/SectionHeader';
import { colors, radius, spacing, cardStyle, shadow } from '../../ui/theme';
import { DashboardRange } from './api';
import { useDashboard } from './hooks';
import {
  barFractions,
  customRangeError,
  deltaLabel,
  fillDaily,
  ratePercent,
} from './logic';
import { toMinor } from '../../money';

type Mode = 7 | 30 | 90 | 'custom';

function Kpi({
  label,
  value,
  delta,
  note,
  hero,
}: {
  label: string;
  value: string;
  delta?: string;
  note?: string;
  hero?: boolean;
}) {
  const { t } = useTranslation();
  // On the red hero card every text is white; elsewhere the usual dark/muted.
  const ink = hero ? styles.heroText : undefined;
  return (
    <View style={[styles.kpi, hero ? styles.hero : styles.kpiSmall]}>
      <Text variant="muted" style={ink}>
        {label}
      </Text>
      <Text variant={hero ? 'metric' : 'display'} style={ink}>
        {value}
      </Text>
      {delta ? (
        <Text variant="muted" style={ink}>
          {t('dashboard.vsPrevious', { change: delta })}
        </Text>
      ) : null}
      {note ? (
        <Text variant="caption" style={ink}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

function DailyBars({ data }: { data: Dashboard }) {
  const { t } = useTranslation();
  const lang = useLang();
  const days = useMemo(
    () => fillDaily(data.period.from, data.period.to, data.daily),
    [data],
  );
  const fractions = barFractions(days);
  const peak = days.reduce(
    (best, d) => (toMinor(d.revenue) > toMinor(best.revenue) ? d : best),
    days[0],
  );
  if (!peak || toMinor(peak.revenue) === 0) {
    return <Text variant="muted">{t('dashboard.noData')}</Text>;
  }
  return (
    <View style={styles.block}>
      <View
        style={styles.bars}
        accessibilityRole="image"
        accessibilityLabel={t('dashboard.dailyRevenue')}
      >
        {fractions.map((f, i) => (
          <View key={days[i].date} style={styles.barSlot}>
            <View
              style={[
                styles.bar,
                { height: `${Math.max(f * 100, f > 0 ? 3 : 0)}%` },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.axis}>
        <Text variant="muted">
          {formatDate(`${days[0].date}T00:00:00Z`, lang)}
        </Text>
        <Text variant="muted">
          {formatDate(`${days[days.length - 1].date}T00:00:00Z`, lang)}
        </Text>
      </View>
      <Text variant="muted">
        {t('dashboard.peak', { amount: formatMoney(peak.revenue, lang) })}
      </Text>
    </View>
  );
}

function Funnel({ data }: { data: Dashboard }) {
  const { t } = useTranslation();
  const lang = useLang();
  const f = data.funnel;
  const rows: Array<[string, number]> = [
    [t('dashboard.funnelView'), f.product_view],
    [t('dashboard.funnelForm'), f.form_engaged],
    [t('dashboard.funnelCart'), f.add_to_cart],
    [t('dashboard.funnelCheckout'), f.checkout_start],
    [t('dashboard.funnelDone'), f.checkout_complete],
  ];
  const max = Math.max(1, ...rows.map(r => r[1]));
  return (
    <View style={styles.block}>
      {rows.map(([label, count]) => (
        <View key={label} style={styles.funnelRow}>
          <View style={styles.line}>
            <Text>{label}</Text>
            <Text variant="label">{formatNumber(count, lang)}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(count / max) * 100}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Full analytics, opened from the Home hero card. */
export function DashboardScreen({ onBack }: { onBack?: () => void } = {}) {
  const { t } = useTranslation();
  const lang = useLang();
  const [mode, setMode] = useState<Mode>(7);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState<{ from: string; to: string } | null>(
    null,
  );
  const [rangeError, setRangeError] = useState<string | null>(null);

  const range: DashboardRange =
    mode === 'custom' && applied
      ? { kind: 'custom', ...applied }
      : { kind: 'days', days: mode === 'custom' ? 7 : mode };
  const dash = useDashboard(range);

  const apply = () => {
    const err = customRangeError(from, to);
    setRangeError(
      err
        ? t(
            err === 'missing'
              ? 'dashboard.rangeMissing'
              : err === 'order'
              ? 'dashboard.rangeOrder'
              : 'dashboard.rangeTooLong',
          )
        : null,
    );
    if (!err) {
      setApplied({ from, to });
    }
  };

  const chips: Array<[Mode, string]> = [
    [7, t('dashboard.days7')],
    [30, t('dashboard.days30')],
    [90, t('dashboard.days90')],
    ['custom', t('dashboard.custom')],
  ];
  const d = dash.data;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <StoreBanner />
      <ScreenHeader title={t('home.insightsTitle')} onBack={onBack} />
      <View style={styles.chips}>
        {chips.map(([key, label]) => (
          <Pressable
            key={String(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === key }}
            onPress={() => setMode(key)}
            style={[styles.chip, mode === key && styles.chipOn]}
          >
            <Text
              variant="label"
              style={mode === key ? styles.chipTextOn : undefined}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {mode === 'custom' ? (
        <View style={styles.block}>
          <DateField
            label={t('dashboard.from')}
            value={from}
            onChange={setFrom}
          />
          <DateField label={t('dashboard.to')} value={to} onChange={setTo} />
          {rangeError ? <Text variant="error">{rangeError}</Text> : null}
          <Button title={t('dashboard.apply')} onPress={apply} />
        </View>
      ) : null}

      {dash.isPending ? (
        <>
          <Skeleton height={90} />
          <Skeleton height={90} />
          <Skeleton height={140} />
        </>
      ) : dash.isError && !d ? (
        <>
          <Text variant="error">{errorMessage(dash.error, t)}</Text>
          <Button
            title={t('common.retry')}
            onPress={() => void dash.refetch()}
          />
        </>
      ) : d ? (
        <>
          {d.pending_payments > 0 ? (
            <Text style={styles.alert}>
              {t('dashboard.pendingPayments', {
                count: formatNumber(d.pending_payments, lang),
              })}
            </Text>
          ) : null}
          {d.low_stock.length > 0 ? (
            <Text style={styles.alert}>
              {t('dashboard.lowStock', {
                count: formatNumber(d.low_stock.length, lang),
              })}
            </Text>
          ) : null}
          <View style={styles.kpis}>
            <Kpi
              hero
              label={t('dashboard.revenue')}
              value={formatMoney(d.revenue, lang)}
              delta={
                deltaLabel(d.revenue_delta_percent)
                  ? formatNumber(deltaLabel(d.revenue_delta_percent), lang)
                  : undefined
              }
              note={t('dashboard.revenueNote')}
            />
            <Kpi
              label={t('dashboard.orders')}
              value={formatNumber(d.orders_count, lang)}
              delta={
                deltaLabel(d.orders_delta_percent)
                  ? formatNumber(deltaLabel(d.orders_delta_percent), lang)
                  : undefined
              }
            />
            <Kpi
              label={t('dashboard.average')}
              value={formatMoney(d.average_order_value, lang)}
            />
            <Kpi
              label={t('dashboard.conversion')}
              value={
                ratePercent(d.conversion_rate)
                  ? formatNumber(ratePercent(d.conversion_rate), lang)
                  : '—'
              }
            />
          </View>

          <SectionHeader title={t('dashboard.dailyRevenue')} />
          <DailyBars data={d} />

          <SectionHeader title={t('dashboard.funnel')} />
          <Funnel data={d} />

          <SectionHeader title={t('dashboard.byStatus')} />
          <View style={styles.block}>
            {Object.entries(d.orders_by_status).map(([status, count]) => (
              <View key={status} style={styles.line}>
                <Text>
                  {t(`orders.status.${status}`, { defaultValue: status })}
                </Text>
                <Text variant="label">{formatNumber(count, lang)}</Text>
              </View>
            ))}
          </View>

          {d.top_products.length > 0 ? (
            <>
              <SectionHeader title={t('dashboard.topProducts')} />
              <View style={styles.block}>
                {d.top_products.map(p => (
                  <View key={p.product_id} style={styles.line}>
                    <Text style={styles.flex}>{p.name}</Text>
                    <Text variant="muted">
                      {t('dashboard.units', {
                        count: formatNumber(p.units, lang),
                      })}{' '}
                      · {formatMoney(p.revenue, lang)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {d.recent_orders.length > 0 ? (
            <>
              <SectionHeader title={t('dashboard.recent')} />
              <View style={styles.block}>
                {d.recent_orders.map(o => (
                  <View key={o.id} style={styles.line}>
                    <Text style={styles.flex}>
                      {o.order_number} · {t(`orders.status.${o.status}`)}
                    </Text>
                    <Text variant="label">{formatMoney(o.total, lang)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {d.checklist.some(c => !c.done) ? (
            <>
              <SectionHeader title={t('dashboard.firstSteps')} />
              <View style={styles.block}>
                {d.checklist.map(c => (
                  <Text
                    key={c.key}
                    accessibilityLabel={`${t(`dashboard.steps.${c.key}`, {
                      defaultValue: c.key,
                    })}: ${c.done ? '✓' : '○'}`}
                  >
                    {c.done ? '✓' : '○'}{' '}
                    {t(`dashboard.steps.${c.key}`, { defaultValue: c.key })}
                  </Text>
                ))}
              </View>
            </>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTextOn: { color: colors.primaryText },
  block: { gap: spacing.sm },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  hero: { width: '100%', backgroundColor: colors.brand, padding: spacing.xl },
  heroText: { color: '#FFFFFF' },
  kpiSmall: { flexGrow: 1, flexBasis: '45%' },
  kpi: {
    ...cardStyle,
    padding: spacing.md,
    gap: 2,
  },
  alert: {
    backgroundColor: colors.warningBg,
    color: colors.warningText,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 1 },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  funnelRow: { gap: 2 },
  track: { height: 8, backgroundColor: colors.surface, borderRadius: 4 },
  fill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  flex: { flex: 1 },
});

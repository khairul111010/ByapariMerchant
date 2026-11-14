import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text as RNText,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { JumpTarget, useJump } from '../../store/jump';
import { usePendingOrder } from '../../store/pendingOrder';
import { Badge, Tone } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Icon, IconName } from '../../ui/Icon';
import { OrderCard } from '../../ui/OrderCard';
import { SectionHeader } from '../../ui/SectionHeader';
import { Skeleton, SkeletonCard, Text } from '../../ui';
import { usePressScale } from '../../ui/press';
import { useStyles, useTheme } from '../../ui/ThemeProvider';
import { Animated } from 'react-native';
import { useMe } from '../auth/useMe';
import { DashboardScreen } from '../dashboard/DashboardScreen';
import { useDashboard } from '../dashboard/hooks';
import { fetchOrders } from '../orders/api';
import { useLowStock } from '../products/hooks';
import { StoreBanner } from '../shell/StoreBanner';
import { greetingFor, initialOf, todayRange } from './logic';
import { shareShop } from './share';

/* A square quick-action tile: icon in a soft circle, short label underneath. */
function Tile({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const press = usePressScale(0.95);
  const s = useStyles(({ c: p, radius, spacing, shadow, font }) => ({
    tile: { flex: 1 },
    body: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.lg,
      backgroundColor: p.card,
      borderWidth: 1,
      borderColor: p.border,
      ...shadow.card,
    },
    circle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: p.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: font.bold,
      fontSize: 13,
      lineHeight: 18,
      color: p.textPrimary,
      textAlign: 'center',
    },
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={s.tile}
    >
      <Animated.View style={[s.body, press.style]}>
        <View style={s.circle}>
          <Icon name={icon} size={22} color={c.primaryFill} />
        </View>
        <RNText style={s.label} numberOfLines={2}>
          {label}
        </RNText>
      </Animated.View>
    </Pressable>
  );
}

/* One "needs attention" row: tinted icon, what it is, how many, a chevron. */
function AttentionRow({
  icon,
  tone,
  label,
  count,
  onPress,
}: {
  icon: IconName;
  tone: Tone;
  label: string;
  count: number;
  onPress: () => void;
}) {
  const lang = useLang();
  const { c } = useTheme();
  const tint = {
    warning: [c.warningSoft, c.warning],
    danger: [c.dangerSoft, c.danger],
    info: [c.infoSoft, c.info],
  } as Record<string, [string, string]>;
  const [bg, fg] = tint[tone] ?? [c.primarySoft, c.primary];
  const s = useStyles(({ spacing }) => ({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    circle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { flex: 1 },
  }));
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${label}: ${count}`}
      padding="md"
    >
      <View style={s.row}>
        <View style={[s.circle, { backgroundColor: bg }]}>
          <Icon name={icon} size={20} color={fg} />
        </View>
        <Text variant="label" style={s.label}>
          {label}
        </Text>
        <Badge label={formatNumber(count, lang)} tone={tone} />
        <Icon name="chevronRight" size={18} color={c.textSecondary} />
      </View>
    </Card>
  );
}

export function HomeScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const { c } = useTheme();
  const { isOwner } = useRole();
  const me = useMe();
  const go = useJump(st => st.go);
  const openOrder = usePendingOrder(st => st.open);
  const [view, setView] = useState<'home' | 'insights'>('home');
  const [noLink, setNoLink] = useState(false);

  const range = useMemo(
    () => ({ kind: 'custom' as const, ...todayRange() }),
    [],
  );
  const today = useDashboard(range);
  const pending = useQuery({
    queryKey: ['orders-count', 'pending'],
    queryFn: () => fetchOrders({ status: 'pending' }, 1),
  });
  const low = useLowStock();

  const s = useStyles(({ c: p, radius, spacing, shadow, font, type }) => ({
    screen: { flex: 1, backgroundColor: p.background },
    body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    headText: { flex: 1 },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: p.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: p.border,
    },
    avatarText: {
      fontFamily: font.bold,
      fontSize: 20,
      lineHeight: 28,
      color: p.primaryFill,
    },
    hero: {
      borderRadius: radius.xl,
      backgroundColor: p.primaryFill,
      padding: spacing.xxl,
      gap: spacing.xs,
      ...shadow.raised,
    },
    heroLabel: {
      fontFamily: font.bold,
      ...type.overline,
      color: p.textOnPrimary,
      opacity: 0.85,
      textTransform: 'uppercase',
    },
    heroMetric: {
      fontFamily: font.bold,
      ...type.metric,
      color: p.textOnPrimary,
    },
    heroSub: {
      fontFamily: font.regular,
      ...type.body,
      color: p.textOnPrimary,
      opacity: 0.9,
    },
    heroButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      minHeight: 40,
      borderRadius: radius.pill,
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    heroButtonText: {
      fontFamily: font.bold,
      fontSize: 14,
      lineHeight: 20,
      color: p.textOnPrimary,
    },
    tiles: { flexDirection: 'row', gap: spacing.md },
    list: { gap: spacing.sm },
    clear: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    clearCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: p.successSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearText: { flex: 1, gap: 2 },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: p.cardSunken,
      overflow: 'hidden',
    },
    fill: { height: 8, borderRadius: 4, backgroundColor: p.primary },
    step: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 40,
    },
  }));

  if (view === 'insights') {
    return <DashboardScreen onBack={() => setView('home')} />;
  }

  const store = me.data?.store;
  const d = today.data;
  const pendingCount = pending.data?.meta.total ?? 0;
  const lowCount = low.data?.length ?? 0;
  const verifyCount = d?.pending_payments ?? 0;
  const anyAttention = pendingCount + lowCount + verifyCount > 0;
  const steps = d?.checklist ?? [];
  const done = steps.filter(x => x.done).length;

  // Where each setup step is done. Settings are owner-only, so staff only get the product step.
  const stepTarget: Record<string, JumpTarget | null> = {
    add_product: { tab: 'Products', screen: 'create' },
    payment_method: isOwner ? { tab: 'More', screen: 'payments' } : null,
    whatsapp: isOwner ? { tab: 'More', screen: 'general' } : null,
    logo: isOwner ? { tab: 'More', screen: 'appearance' } : null,
  };

  const refresh = () => {
    void today.refetch();
    void pending.refetch();
    void low.refetch();
    void me.refetch();
  };

  return (
    <View style={s.screen}>
      <StoreBanner />
      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={today.isRefetching}
            onRefresh={refresh}
            colors={[c.primary]}
            tintColor={c.primary}
          />
        }
      >
        <View style={s.head}>
          <View style={s.headText}>
            <Text variant="muted">{t(`home.greeting.${greetingFor()}`)}</Text>
            <Text variant="display" numberOfLines={1}>
              {store?.name ?? ''}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.openProfile')}
            onPress={() => go({ tab: 'More', screen: 'storefront' })}
            style={s.avatar}
          >
            <RNText style={s.avatarText}>{initialOf(store?.name)}</RNText>
          </Pressable>
        </View>

        {today.isPending ? (
          <Skeleton height={170} rounded={24} />
        ) : (
          <View style={s.hero}>
            <RNText style={s.heroLabel}>{t('home.today')}</RNText>
            <RNText style={s.heroMetric} accessibilityRole="header">
              {d ? formatMoney(d.revenue, lang) : '—'}
            </RNText>
            <RNText style={s.heroSub}>
              {t('home.ordersToday', {
                count: formatNumber(d?.orders_count ?? 0, lang),
              })}
            </RNText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setView('insights')}
              style={s.heroButton}
            >
              <Icon name="chart" size={18} color={c.textOnPrimary} />
              <RNText style={s.heroButtonText}>{t('home.insights')}</RNText>
            </Pressable>
          </View>
        )}

        <View style={s.tiles}>
          <Tile
            icon="sell"
            label={t('home.quick.sale')}
            onPress={() => go({ tab: 'More', screen: { sell: 'pos' } })}
          />
          <Tile
            icon="plus"
            label={t('home.quick.product')}
            onPress={() => go({ tab: 'Products', screen: 'create' })}
          />
          <Tile
            icon="scan"
            label={t('home.quick.scan')}
            onPress={() => go({ tab: 'Products', screen: 'scan' })}
          />
          <Tile
            icon="share"
            label={t('home.quick.share')}
            onPress={() => void shareShop(store, t).then(ok => setNoLink(!ok))}
          />
        </View>
        {noLink ? <Text variant="muted">{t('home.noLink')}</Text> : null}

        <SectionHeader title={t('home.attention')} />
        {pending.isPending || low.isPending || today.isPending ? (
          <Skeleton height={64} />
        ) : anyAttention ? (
          <View style={s.list}>
            {pendingCount > 0 ? (
              <AttentionRow
                icon="clock"
                tone="warning"
                label={t('home.toConfirm')}
                count={pendingCount}
                onPress={() => go({ tab: 'Orders', status: 'pending' })}
              />
            ) : null}
            {verifyCount > 0 ? (
              <AttentionRow
                icon="wallet"
                tone="info"
                label={t('home.toVerify')}
                count={verifyCount}
                onPress={() => go({ tab: 'Orders', status: 'pending' })}
              />
            ) : null}
            {lowCount > 0 ? (
              <AttentionRow
                icon="alert"
                tone="danger"
                label={t('home.lowStock')}
                count={lowCount}
                onPress={() => go({ tab: 'Products', screen: 'low' })}
              />
            ) : null}
          </View>
        ) : (
          <Card>
            <View style={s.clear}>
              <View style={s.clearCircle}>
                <Icon name="check" size={22} color={c.success} />
              </View>
              <View style={s.clearText}>
                <Text variant="label">{t('home.allClear')}</Text>
                <Text variant="muted">{t('home.allClearBody')}</Text>
              </View>
            </View>
          </Card>
        )}

        {steps.length > 0 && done < steps.length ? (
          <>
            <SectionHeader
              title={t('home.setup')}
              subtitle={t('home.setupProgress', {
                done: formatNumber(done, lang),
                total: formatNumber(steps.length, lang),
              })}
            />
            <Card>
              <View
                style={s.track}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <View
                  style={[s.fill, { width: `${(done / steps.length) * 100}%` }]}
                />
              </View>
              {steps.map(step => {
                const target = stepTarget[step.key];
                const label = t(`dashboard.steps.${step.key}`, {
                  defaultValue: step.key,
                });
                const content = (
                  <View style={s.step}>
                    <Icon
                      name={step.done ? 'check' : 'chevronRight'}
                      size={18}
                      color={step.done ? c.success : c.textSecondary}
                    />
                    <Text variant={step.done ? 'muted' : 'label'}>{label}</Text>
                  </View>
                );
                return !step.done && target ? (
                  <Pressable
                    key={step.key}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={() => go(target)}
                  >
                    {content}
                  </Pressable>
                ) : (
                  <View
                    key={step.key}
                    accessibilityLabel={`${label}: ${step.done ? '✓' : ''}`}
                  >
                    {content}
                  </View>
                );
              })}
            </Card>
          </>
        ) : null}

        <SectionHeader
          title={t('home.recent')}
          actionLabel={t('home.seeAll')}
          onAction={() => go({ tab: 'Orders' })}
        />
        {today.isPending ? (
          <SkeletonCard />
        ) : (d?.recent_orders ?? []).length === 0 ? (
          <Text variant="muted">{t('dashboard.noData')}</Text>
        ) : (
          <View>
            {(d?.recent_orders ?? []).slice(0, 3).map(o => (
              <OrderCard key={o.id} order={o} onPress={() => openOrder(o.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

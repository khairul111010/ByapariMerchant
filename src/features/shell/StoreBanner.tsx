import React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRole } from '../../hooks/useRole';
import { formatNumber } from '../../i18n/format';
import { useLang } from '../../i18n';
import { useJump } from '../../store/jump';
import { Text } from '../../ui';
import { touch } from '../../ui/theme';
import { useStyles, useTheme } from '../../ui/ThemeProvider';
import { useMe } from '../auth/useMe';
import { pickStoreBanner } from '../plan/logic';

/**
 * The one app-wide store banner, most urgent first (see pickStoreBanner): not live yet,
 * trial ended, trial running, orders over / near the monthly limit. The order limit only ever
 * warns; orders are never blocked. Owners can tap the text to open the Subscription screen;
 * staff see the same banner without that link.
 */
export function StoreBanner() {
  const { t } = useTranslation();
  const lang = useLang();
  const { c } = useTheme();
  const { isOwner } = useRole();
  const go = useJump(st => st.go);
  const { data } = useMe();
  const s = useStyles(({ spacing, radius }) => ({
    wrap: { padding: spacing.md, gap: spacing.sm },
    action: {
      minHeight: touch,
      justifyContent: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1.5,
    },
  }));

  const banner = pickStoreBanner(data);
  if (!banner || !data) {
    return null;
  }

  const tone =
    banner.kind === 'orders_over' || banner.kind === 'trial_ended'
      ? { bg: c.dangerSoft, fg: c.dangerText }
      : banner.kind === 'trial'
      ? { bg: c.primarySoft, fg: c.primaryFill }
      : { bg: c.warningSoft, fg: c.warningText };

  const message =
    banner.kind === 'pending'
      ? t('pending.banner')
      : banner.kind === 'trial_ended'
      ? t('pending.trialEnded')
      : banner.kind === 'trial'
      ? banner.daysLeft === 0
        ? t('pending.trialLastDay')
        : t('pending.trialDays', {
            count: formatNumber(banner.daysLeft ?? 0, lang),
          })
      : banner.kind === 'orders_over'
      ? t('pending.ordersOver')
      : t('pending.ordersNear');

  // The order-limit banners have no payment button: upgrading happens at renewal.
  const whatsapp =
    banner.kind === 'orders_over' || banner.kind === 'orders_near'
      ? null
      : data.platform.support_whatsapp_url ?? null;
  const actionLabel =
    banner.kind === 'pending' ? t('pending.action') : t('pending.pay');

  const text = (
    <Text variant="label" style={{ color: tone.fg }}>
      {message}
    </Text>
  );

  return (
    <View style={[s.wrap, { backgroundColor: tone.bg }]}>
      {isOwner ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={message}
          accessibilityHint={t('pending.openPlan')}
          onPress={() => go({ tab: 'More', screen: 'plan' })}
        >
          {text}
        </Pressable>
      ) : (
        text
      )}
      {whatsapp ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={actionLabel}
          style={[s.action, { borderColor: tone.fg }]}
          onPress={() => void Linking.openURL(whatsapp)}
        >
          <Text variant="label" style={{ color: tone.fg }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

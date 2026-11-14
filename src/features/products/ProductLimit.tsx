import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRole } from '../../hooks/useRole';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { formatCount } from '../../i18n/format';
import { useLang } from '../../i18n';
import { useJump } from '../../store/jump';
import { Button, Text } from '../../ui';
import { productsTone } from '../plan/logic';
import { usePlan } from '../plan/hooks';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { Sheet } from '../../ui/Sheet';
import { touch } from '../../ui/theme';
import { useStyles, useTheme } from '../../ui/ThemeProvider';

/**
 * The upgrade prompt for the plan's product cap (`limits.can_add_product` false, or a
 * `403 product_limit_reached`). It is never a form error. Owners get a button to the
 * Subscription screen; staff can't open it, so they are told to ask the owner.
 */
function ProductLimitBody({
  max,
  onLeave,
}: {
  max: number | null;
  onLeave?: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const { isOwner } = useRole();
  const go = useJump(st => st.go);
  return (
    <>
      <Text>
        {max !== null
          ? t('products.limit.message', { max: formatCount(max, lang) })
          : t('products.limit.messageNoMax')}
      </Text>
      {isOwner ? (
        <Button
          title={t('products.limit.seePlans')}
          onPress={() => {
            onLeave?.();
            go({ tab: 'More', screen: 'plan' });
          }}
        />
      ) : (
        <Text variant="muted">{t('products.limit.staffHint')}</Text>
      )}
    </>
  );
}

/** Shown instead of the create form when `/me` already says the cap is reached. */
export function ProductLimitScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { maxProducts } = usePlanLimits();
  const s = useStyles(({ c, spacing }) => ({
    screen: { flex: 1, backgroundColor: c.background },
    wrap: { padding: spacing.lg, gap: spacing.md },
  }));
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.wrap}>
      <ScreenHeader title={t('products.limit.title')} onBack={onBack} />
      <ProductLimitBody max={maxProducts} onLeave={onBack} />
    </ScrollView>
  );
}

/** Shown over the create form when the server refuses with `403 product_limit_reached`. */
export function ProductLimitSheet({
  visible,
  max,
  onClose,
  onLeave,
}: {
  visible: boolean;
  max: number | null;
  onClose: () => void;
  onLeave?: () => void;
}) {
  const { t } = useTranslation();
  const s = useStyles(({ spacing }) => ({ body: { gap: spacing.md } }));
  return (
    <Sheet visible={visible} onClose={onClose} title={t('products.limit.title')}>
      <View style={s.body}>
        <ProductLimitBody max={max} onLeave={onLeave} />
      </View>
    </Sheet>
  );
}

/**
 * "{used} of {max} products on your plan" above the products list; hidden when unlimited.
 * The count comes from `/plan`, which only owners can read. Staff see a line only at the cap
 * (from `/me` limits), without the link to the Subscription screen.
 */
export function ProductCapLine() {
  const { t } = useTranslation();
  const lang = useLang();
  const { c } = useTheme();
  const { isOwner } = useRole();
  const { maxProducts, canAddProduct } = usePlanLimits();
  const plan = usePlan({ enabled: isOwner });
  const go = useJump(st => st.go);
  const s = useStyles(({ spacing }) => ({
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.md },
    link: { minHeight: touch, justifyContent: 'center' },
  }));

  const usage = plan.data?.usage.products;
  if (isOwner && usage) {
    if (usage.max === null) {
      return null;
    }
    const full = productsTone(usage) === 'danger';
    return (
      <View style={s.row}>
        <Text variant={full ? undefined : 'muted'} style={full ? { color: c.dangerText } : undefined}>
          {t('products.planCount', {
            used: formatCount(usage.used, lang),
            max: formatCount(usage.max, lang),
          })}
        </Text>
        {full ? (
          <Pressable
            accessibilityRole="link"
            style={s.link}
            onPress={() => go({ tab: 'More', screen: 'plan' })}
          >
            <Text variant="label" style={{ color: c.primaryFill }}>
              {t('products.upgradeToAdd')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  // Staff (or `/plan` not loaded yet): only say something when `/me` says the cap is reached.
  if (!canAddProduct && maxProducts !== null) {
    return (
      <Text style={{ color: c.dangerText }}>
        {t('products.limit.message', { max: formatCount(maxProducts, lang) })}
      </Text>
    );
  }
  return null;
}

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text as RNText, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useMe } from '../features/auth/useMe';
import { shareShop } from '../features/home/share';
import { JumpTarget, useJump } from '../store/jump';
import { Icon, IconName } from './Icon';
import { usePressScale } from './press';
import { Sheet } from './Sheet';
import { useStyles, useTheme } from './ThemeProvider';

const ICONS: Record<string, IconName> = {
  Dashboard: 'home',
  Orders: 'orders',
  Products: 'products',
  More: 'more',
};

function useBarStyles() {
  return useStyles(({ c, radius, spacing, shadow, font }) => ({
    outer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      paddingTop: spacing.xs,
      backgroundColor: c.background,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
      ...shadow.raised,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      minHeight: 56,
      justifyContent: 'center',
    },
    iconWrap: {
      width: 52,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pill: {
      position: 'absolute',
      width: 52,
      height: 30,
      borderRadius: radius.pill,
      backgroundColor: c.primarySoft,
    },
    label: {
      fontFamily: font.regular,
      fontSize: 11,
      lineHeight: 15,
      color: c.textSecondary,
    },
    labelOn: { fontFamily: font.bold, color: c.primaryFill },
    plusWrap: { width: 64, alignItems: 'center' },
    plus: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: c.primaryFill,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.raised,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 60,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    actionCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionText: {
      flex: 1,
      fontFamily: font.bold,
      fontSize: 15,
      lineHeight: 22,
      color: c.textPrimary,
    },
  }));
}

function Item({
  label,
  icon,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: IconName;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const s = useBarStyles();
  const { c } = useTheme();
  const grow = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(grow, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [focused, grow]);
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={s.item}
    >
      <View style={s.iconWrap}>
        <Animated.View
          style={[
            s.pill,
            {
              opacity: grow,
              transform: [
                {
                  scaleX: grow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Icon
          name={icon}
          size={23}
          color={focused ? c.primaryFill : c.textSecondary}
        />
      </View>
      <RNText style={[s.label, focused && s.labelOn]} numberOfLines={1}>
        {label}
      </RNText>
    </Pressable>
  );
}

/** The centre "+": the most common jobs one tap away from any tab. */
function CreateButton() {
  const { t } = useTranslation();
  const { c } = useTheme();
  const s = useBarStyles();
  const press = usePressScale(0.92);
  const go = useJump(st => st.go);
  const store = useMe().data?.store;
  const [open, setOpen] = useState(false);

  const actions: Array<{ icon: IconName; label: string; run: () => void }> = [
    {
      icon: 'sell',
      label: t('home.quick.sale'),
      run: () => go({ tab: 'More', screen: { sell: 'pos' } } as JumpTarget),
    },
    {
      icon: 'plus',
      label: t('home.quick.product'),
      run: () => go({ tab: 'Products', screen: 'create' }),
    },
    {
      icon: 'scan',
      label: t('home.quick.scan'),
      run: () => go({ tab: 'Products', screen: 'scan' }),
    },
    {
      icon: 'share',
      label: t('home.quick.share'),
      run: () => void shareShop(store, t),
    },
  ];

  return (
    <View style={s.plusWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.create')}
        onPress={() => setOpen(true)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
      >
        <Animated.View style={[s.plus, press.style]}>
          <Icon
            name="plus"
            size={26}
            color={c.textOnPrimary}
            strokeWidth={2.4}
          />
        </Animated.View>
      </Pressable>
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('home.createTitle')}
      >
        {actions.map(a => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            onPress={() => {
              setOpen(false);
              a.run();
            }}
            style={s.action}
          >
            <View style={s.actionCircle}>
              <Icon name={a.icon} size={20} color={c.primaryFill} />
            </View>
            <RNText style={s.actionText}>{a.label}</RNText>
            <Icon name="chevronRight" size={18} color={c.textSecondary} />
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

/** A floating rounded bar, two tabs either side of a raised "+". */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const s = useBarStyles();
  const items = state.routes.map((route, index) => {
    const focused = state.index === index;
    const { options } = descriptors[route.key];
    const label = (options.title ?? route.name) as string;
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };
    return (
      <Item
        key={route.key}
        label={label}
        icon={ICONS[route.name] ?? 'more'}
        focused={focused}
        onPress={onPress}
        onLongPress={() =>
          navigation.emit({ type: 'tabLongPress', target: route.key })
        }
      />
    );
  });
  const middle = Math.ceil(items.length / 2);
  return (
    <View style={s.outer} pointerEvents="box-none">
      <View style={s.bar}>
        {items.slice(0, middle)}
        <CreateButton />
        {items.slice(middle)}
      </View>
    </View>
  );
}

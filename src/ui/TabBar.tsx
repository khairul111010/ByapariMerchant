import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon, IconName } from './Icon';
import { colors, radius, shadow, spacing } from './theme';
import { Text } from './index';

const ICONS: Record<string, IconName> = {
  Dashboard: 'home',
  Orders: 'orders',
  Products: 'products',
  Sell: 'sell',
  More: 'more',
};

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
      style={styles.item}
    >
      <View style={styles.iconWrap}>
        <Animated.View
          style={[
            styles.pill,
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
          size={24}
          color={focused ? colors.primary : colors.textMuted}
        />
      </View>
      <Text
        variant="caption"
        numberOfLines={1}
        style={[styles.label, focused && styles.labelOn]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** A floating rounded bar with a soft shadow: the app's main navigation. */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.outer} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
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
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    backgroundColor: colors.bg,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
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
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 56,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  label: { color: colors.textMuted },
  labelOn: { color: colors.primary, fontFamily: 'NotoSansBengali-Bold' },
});

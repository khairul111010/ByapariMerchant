import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { colors, radius, shadow, spacing } from './theme';
import { Text } from './index';

const SCREEN_H = Dimensions.get('window').height;

/**
 * A bottom sheet: slides up over a dimmed backdrop, closes on a backdrop tap, the Android back
 * button, or by dragging the handle down. Content scrolls if it is taller than the sheet.
 */
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(visible);
  const slide = useRef(new Animated.Value(SCREEN_H)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slide, {
          toValue: 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 3,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: SCREEN_H,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, mounted, slide, fade]);

  const close = useCallback(() => onClose(), [onClose]);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_e, g) => g.dy > 0 && slide.setValue(g.dy),
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 110 || g.vy > 0.9) {
          close();
        } else {
          Animated.spring(slide, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
          }).start();
        }
      },
    }),
  ).current;

  if (!mounted) {
    return null;
  }
  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={close}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityLabel="Close"
            accessibilityRole="button"
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slide }] }]}
        >
          <View
            {...pan.panHandlers}
            style={styles.handleArea}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View style={styles.handle} />
          </View>
          {title ? (
            <Text
              variant="subtitle"
              style={styles.title}
              accessibilityRole="header"
            >
              {title}
            </Text>
          ) : null}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.raised,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  title: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
});

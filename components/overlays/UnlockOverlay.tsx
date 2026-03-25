/**
 * Sovereign -- UnlockOverlay
 *
 * Tab unlock notification displayed when a new game tab becomes available.
 * Slides in from the bottom with a gold border accent. Shows the tab icon
 * and name with an "UNLOCKED" label. Auto-dismisses after 2s or on tap.
 *
 * @see SOV_PRD_08_ONBOARDING -- progressive tab unlock
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UnlockOverlayProps {
  tabName: string;
  icon: string;
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUTO_DISMISS_MS = 2000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UnlockOverlay({ tabName, icon, onDismiss }: UnlockOverlayProps) {
  const translateY = useSharedValue(200);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Slide up
    translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 300 });

    // Auto-dismiss
    const timer = setTimeout(() => {
      translateY.value = withTiming(200, { duration: 300, easing: Easing.in(Easing.ease) });
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(onDismiss, 350);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.pressable} onPress={onDismiss}>
        <Animated.View style={[styles.card, containerStyle]}>
          <Text style={styles.label}>UNLOCKED</Text>
          <View style={styles.row}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.tabName}>{tabName}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 150,
    // Semi-transparent backdrop
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  pressable: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.huge,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 220,
    // Gold glow
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },

  label: {
    ...typography.label,
    color: colors.gold,
    letterSpacing: 3,
    fontSize: 11,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  icon: {
    fontSize: 28,
  },

  tabName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
});

export default UnlockOverlay;

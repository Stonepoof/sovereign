/**
 * Sovereign — Meter Delta Animation Hook
 *
 * Produces animated props for floating delta numbers that appear
 * when meters change. Each delta floats up 30px over 1s and fades out.
 * Deltas are staggered by 100ms per item.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY — meter animation spec
 */

import { useEffect, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import type { MeterDelta } from '../types';
import { colors } from '../theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Distance the delta text floats upward in pixels. */
const FLOAT_DISTANCE = 30;

/** Duration of the float + fade animation in ms. */
const ANIMATION_DURATION = 1000;

/** Stagger delay between each delta in ms. */
const STAGGER_DELAY = 100;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnimatedDeltaProps {
  /** The meter name for this delta. */
  meter: string;
  /** The signed delta amount. */
  amount: number;
  /** Color for this delta (green for positive, red for negative). */
  color: string;
  /** Formatted display string (e.g. "+5" or "-3"). */
  displayText: string;
  /** Animated style with translateY and opacity. */
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

// ---------------------------------------------------------------------------
// Single Delta Animation (internal)
// ---------------------------------------------------------------------------

function useSingleDeltaAnimation(index: number, triggerKey: string) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!triggerKey) return;

    // Reset
    translateY.value = 0;
    opacity.value = 1;

    // Animate with stagger
    const delay = index * STAGGER_DELAY;
    translateY.value = withDelay(
      delay,
      withTiming(-FLOAT_DISTANCE, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.ease),
      }),
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.ease),
      }),
    );
  }, [triggerKey, index, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Maximum number of simultaneous delta animations supported.
 * We pre-allocate shared values for this many slots to follow
 * the rules of hooks (constant number of hook calls).
 */
const MAX_DELTAS = 8;

export function useMeterAnimation(deltas: MeterDelta[]): AnimatedDeltaProps[] {
  // Generate a stable trigger key when deltas change
  const triggerKeyRef = useRef('');
  const currentKey = deltas.map((d) => `${d.meter}:${d.amount}`).join('|');

  if (currentKey !== triggerKeyRef.current) {
    triggerKeyRef.current = currentKey;
  }

  // Pre-allocate animation hooks for MAX_DELTAS slots
  // (hooks must always be called in the same order)
  const styles: ReturnType<typeof useAnimatedStyle>[] = [];
  for (let i = 0; i < MAX_DELTAS; i++) {
    // Only animate slots that have actual deltas
    const isActive = i < deltas.length;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    styles.push(useSingleDeltaAnimation(i, isActive ? triggerKeyRef.current : ''));
  }

  // Map deltas to animated props
  return deltas.slice(0, MAX_DELTAS).map((delta, index) => {
    const isPositive = delta.amount > 0;
    return {
      meter: delta.meter,
      amount: delta.amount,
      color: isPositive ? colors.success : colors.error,
      displayText: isPositive ? `+${delta.amount}` : `${delta.amount}`,
      animatedStyle: styles[index],
    };
  });
}

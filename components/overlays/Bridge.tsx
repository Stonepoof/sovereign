/**
 * Sovereign -- Bridge Overlay
 *
 * Phase transition overlay between origin cards. Brief black screen (~1s)
 * with optional text (e.g., "Three days later..."). Fades in, holds,
 * fades out, then calls onComplete.
 *
 * @see SOV_PRD_08_ONBOARDING -- transition overlays between origin cards
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BridgeProps {
  text?: string;
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How long the bridge stays fully visible (ms). */
const HOLD_MS = 600;
/** Fade-in duration (ms). */
const FADE_IN_MS = 300;
/** Fade-out duration (ms). */
const FADE_OUT_MS = 300;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Bridge({ text, onComplete }: BridgeProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in -> hold -> fade out -> call onComplete
    opacity.value = withSequence(
      withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.ease) }),
      withDelay(
        HOLD_MS,
        withTiming(0, { duration: FADE_OUT_MS, easing: Easing.in(Easing.ease) }),
      ),
    );

    const totalMs = FADE_IN_MS + HOLD_MS + FADE_OUT_MS + 50;
    const timer = setTimeout(onComplete, totalMs);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, animStyle]}>
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  text: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});

export default Bridge;

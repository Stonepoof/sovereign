/**
 * Sovereign -- DiceOverlay
 *
 * Full-screen overlay for dice roll animations.
 * States: waiting (tap to roll) -> rolling (rapid number changes) -> result (success/fail).
 * Auto-dismisses after 1.8s or on tap during result state.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import type { DieType, DiceResult } from '../../types';
import { useDiceRoll } from '../../hooks/useDiceRoll';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DiceOverlayProps {
  visible: boolean;
  die: DieType;
  modifier: number;
  onResult: (result: DiceResult) => void;
}

// ---------------------------------------------------------------------------
// Die display labels
// ---------------------------------------------------------------------------

const DIE_LABELS: Record<DieType, string> = {
  d4: 'D4',
  d6: 'D6',
  d8: 'D8',
  d10: 'D10',
  d12: 'D12',
  d20: 'D20',
};

const DIE_EMOJI: Record<DieType, string> = {
  d4: '\u{1F3B2}',  // game die
  d6: '\u{1F3B2}',
  d8: '\u{1F3B2}',
  d10: '\u{1F3B2}',
  d12: '\u{1F3B2}',
  d20: '\u{1F3B2}',
};

// ---------------------------------------------------------------------------
// Auto-dismiss duration
// ---------------------------------------------------------------------------

const AUTO_DISMISS_MS = 1800;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiceOverlay({ visible, die, modifier, onResult }: DiceOverlayProps) {
  const { phase, displayValue, result, startRoll, reset } = useDiceRoll();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shake animation for rolling state
  const shakeX = useSharedValue(0);
  // Overlay fade
  const overlayOpacity = useSharedValue(0);
  // Result glow
  const glowOpacity = useSharedValue(0);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      reset();
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      cleanup();
    }
  }, [visible]);

  // Shake during rolling
  useEffect(() => {
    if (phase === 'rolling') {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 30 }),
          withTiming(3, { duration: 30 }),
          withTiming(-2, { duration: 30 }),
          withTiming(2, { duration: 30 }),
          withTiming(0, { duration: 30 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(shakeX);
      shakeX.value = withTiming(0, { duration: 50 });
    }
  }, [phase]);

  // Glow on result
  useEffect(() => {
    if (phase === 'result' && result) {
      glowOpacity.value = withTiming(1, { duration: 300 });

      // Fire result callback
      onResult(result);

      // Auto-dismiss timer
      dismissTimer.current = setTimeout(() => {
        dismissTimer.current = null;
      }, AUTO_DISMISS_MS);
    } else {
      glowOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [phase, result]);

  const cleanup = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  // Handle tap events
  const handlePress = useCallback(() => {
    if (phase === 'waiting') {
      startRoll(die, modifier);
    }
    // Tap during result or rolling is a no-op (let animation play)
  }, [phase, die, modifier, startRoll]);

  // Animated styles
  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!visible) return null;

  const isSuccess = result?.success ?? false;
  const isCritical = result?.critical ?? false;

  return (
    <Animated.View style={[styles.overlay, overlayAnimStyle]}>
      <Pressable style={styles.pressable} onPress={handlePress}>
        <View style={styles.content}>
          {/* Die type label */}
          <Text style={styles.dieLabel}>{DIE_LABELS[die]}</Text>

          {/* Die icon / number display */}
          <Animated.View style={[styles.dieContainer, shakeStyle]}>
            {phase === 'waiting' ? (
              <Text style={styles.dieEmoji}>{DIE_EMOJI[die]}</Text>
            ) : (
              <View style={styles.numberContainer}>
                <Text
                  style={[
                    styles.displayNumber,
                    phase === 'result' && isSuccess && styles.numberSuccess,
                    phase === 'result' && !isSuccess && styles.numberFail,
                  ]}
                >
                  {displayValue}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Modifier display */}
          {modifier !== 0 && (
            <Text style={styles.modifierText}>
              {modifier > 0 ? `+${modifier}` : modifier}
            </Text>
          )}

          {/* State-specific text */}
          {phase === 'waiting' && (
            <Text style={styles.instructionText}>Tap to Roll</Text>
          )}

          {phase === 'rolling' && (
            <Text style={styles.rollingText}>Rolling...</Text>
          )}

          {phase === 'result' && result && (
            <View style={styles.resultInfo}>
              {/* Total with modifier */}
              <Text style={styles.totalText}>
                Total: {result.total}
                {result.modifier !== 0 && (
                  <Text style={styles.totalBreakdown}>
                    {' '}({result.natural}{result.modifier > 0 ? '+' : ''}{result.modifier})
                  </Text>
                )}
              </Text>

              {/* Success / Fail text */}
              <Animated.View style={[styles.resultBadge, glowStyle]}>
                <Text
                  style={[
                    styles.resultText,
                    isSuccess ? styles.resultSuccess : styles.resultFail,
                  ]}
                >
                  {isCritical && isSuccess
                    ? 'Critical Success!'
                    : isCritical && !isSuccess
                    ? 'Critical Fail!'
                    : isSuccess
                    ? 'Success!'
                    : 'Failed...'}
                </Text>
              </Animated.View>

              {/* Threshold info */}
              <Text style={styles.thresholdText}>
                Needed: {result.threshold}+
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  pressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  dieLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  dieContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dieEmoji: {
    fontSize: 64,
  },
  numberContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayNumber: {
    ...typography.diceResult,
    color: colors.textPrimary,
  },
  numberSuccess: {
    color: '#28a745',
  },
  numberFail: {
    color: '#dc3545',
  },
  modifierText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gold,
    marginTop: 16,
    letterSpacing: 1,
  },
  rollingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 16,
  },
  resultInfo: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalBreakdown: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  resultBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  resultSuccess: {
    color: '#28a745',
    textShadowColor: 'rgba(40, 167, 69, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  resultFail: {
    color: '#dc3545',
    textShadowColor: 'rgba(220, 53, 69, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  thresholdText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 4,
  },
});

export default DiceOverlay;

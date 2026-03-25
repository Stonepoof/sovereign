/**
 * Sovereign -- DiceOverlay
 *
 * Full-screen overlay for dice roll animations.
 * States: waiting (tap to roll) -> rolling (rapid number changes) -> result (success/fail).
 * Auto-dismisses after 1.8s or on tap during result state.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
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
  const shakeX = useRef(new Animated.Value(0)).current;
  // Overlay fade
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  // Result glow
  const glowOpacity = useRef(new Animated.Value(0)).current;
  // Ref to store the shake animation so we can stop it
  const shakeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      reset();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
      cleanup();
    }
  }, [visible]);

  // Shake during rolling
  useEffect(() => {
    if (phase === 'rolling') {
      const shakeAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeX, { toValue: -3, duration: 30, useNativeDriver: false }),
          Animated.timing(shakeX, { toValue: 3, duration: 30, useNativeDriver: false }),
          Animated.timing(shakeX, { toValue: -2, duration: 30, useNativeDriver: false }),
          Animated.timing(shakeX, { toValue: 2, duration: 30, useNativeDriver: false }),
          Animated.timing(shakeX, { toValue: 0, duration: 30, useNativeDriver: false }),
        ]),
      );
      shakeAnimRef.current = shakeAnim;
      shakeAnim.start();
    } else {
      if (shakeAnimRef.current) {
        shakeAnimRef.current.stop();
        shakeAnimRef.current = null;
      }
      Animated.timing(shakeX, {
        toValue: 0,
        duration: 50,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (shakeAnimRef.current) {
        shakeAnimRef.current.stop();
        shakeAnimRef.current = null;
      }
    };
  }, [phase]);

  // Glow on result
  useEffect(() => {
    if (phase === 'result' && result) {
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Fire result callback
      onResult(result);

      // Auto-dismiss timer
      dismissTimer.current = setTimeout(() => {
        dismissTimer.current = null;
      }, AUTO_DISMISS_MS);
    } else {
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
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

  if (!visible) return null;

  const isSuccess = result?.success ?? false;
  const isCritical = result?.critical ?? false;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Pressable style={styles.pressable} onPress={handlePress}>
        <View style={styles.content}>
          {/* Die type label */}
          <Text style={styles.dieLabel}>{DIE_LABELS[die]}</Text>

          {/* Die icon / number display */}
          <Animated.View style={[styles.dieContainer, { transform: [{ translateX: shakeX }] }]}>
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
              <Animated.View style={[styles.resultBadge, { opacity: glowOpacity }]}>
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

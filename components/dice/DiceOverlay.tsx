// ─── DiceOverlay ─────────────────────────────────────────────────────────────
// Full-screen overlay for dice rolls. 3 states: waiting, rolling, result.
// Uses useDiceRoll hook.

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDiceRoll } from '../../hooks/useDiceRoll';
import type { DiceResult } from '../../types';

interface DiceOverlayProps {
  threshold?: number;
  onResult: (result: DiceResult) => void;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function DiceOverlay({ threshold = 4, onResult }: DiceOverlayProps) {
  const { phase, displayValue, result, roll } = useDiceRoll({
    threshold,
    onResult,
  });

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [scaleAnim]);

  useEffect(() => {
    if (phase === 'rolling') {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: false,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: false,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: false,
          }),
        ])
      );
      shake.start();
      return () => shake.stop();
    } else {
      shakeAnim.setValue(0);
    }
  }, [phase, shakeAnim]);

  const diceFace = DICE_FACES[displayValue - 1] ?? '⚀';

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              { scale: scaleAnim },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        <Text style={styles.title}>FATE DECIDES</Text>
        <Text style={styles.thresholdText}>Need {threshold}+ to succeed</Text>

        <Text style={styles.diceEmoji}>{diceFace}</Text>
        <Text style={styles.diceNumber}>{displayValue}</Text>

        {phase === 'waiting' && (
          <TouchableOpacity onPress={roll} style={styles.rollButton}>
            <Text style={styles.rollButtonText}>ROLL</Text>
          </TouchableOpacity>
        )}

        {phase === 'rolling' && (
          <Text style={styles.rollingText}>Rolling...</Text>
        )}

        {phase === 'result' && result && (
          <View style={styles.resultContainer}>
            <Text
              style={[
                styles.resultText,
                { color: result.success ? colors.success : colors.danger },
              ]}
            >
              {result.success ? 'SUCCESS' : 'FAILURE'}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  thresholdText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  diceEmoji: {
    fontSize: 80,
    marginBottom: spacing.sm,
  },
  diceNumber: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.xxl,
  },
  rollButton: {
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.massive,
    borderRadius: borderRadius.md,
  },
  rollButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.heavy,
    color: '#000000',
    letterSpacing: 2,
  },
  rollingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.heavy,
    letterSpacing: 2,
  },
});

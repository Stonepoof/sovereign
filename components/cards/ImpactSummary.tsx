// ─── ImpactSummary ───────────────────────────────────────────────────────────
// Shows: direction arrow, choice text, dice result, narrative, meter chips.
// Auto-advances after display.

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import type { SwipeDirection, MeterDelta, DiceResult } from '../../types';

interface ImpactSummaryProps {
  direction: SwipeDirection;
  choiceLabel: string;
  narrative: string;
  meterDeltas: MeterDelta[];
  diceResult?: DiceResult | null;
  onAdvance: () => void;
}

const DIRECTION_ARROWS: Record<SwipeDirection, string> = {
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
};

export function ImpactSummary({
  direction,
  choiceLabel,
  narrative,
  meterDeltas,
  diceResult,
  onAdvance,
}: ImpactSummaryProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { skip } = useAutoAdvance({
    text: narrative,
    baseMs: 4000,
    perWordMs: 150,
    onAdvance,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  return (
    <TouchableOpacity onPress={skip} activeOpacity={0.9}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Direction + Choice */}
        <View style={styles.choiceRow}>
          <Text style={[styles.arrow, { color: colors.swipe[direction] }]}>
            {DIRECTION_ARROWS[direction]}
          </Text>
          <Text style={styles.choiceLabel}>{choiceLabel}</Text>
        </View>

        {/* Dice result */}
        {diceResult && (
          <View style={styles.diceRow}>
            <Text style={styles.diceLabel}>🎲 Rolled: {diceResult.value}</Text>
            <Text
              style={[
                styles.diceResult,
                { color: diceResult.success ? colors.success : colors.danger },
              ]}
            >
              {diceResult.success ? 'SUCCESS' : 'FAILURE'}
            </Text>
          </View>
        )}

        {/* Narrative */}
        <Text style={styles.narrative}>{narrative}</Text>

        {/* Meter chips */}
        <View style={styles.chipsContainer}>
          {meterDeltas.map((md, i) => {
            const isPositive = md.delta > 0;
            return (
              <View
                key={i}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isPositive
                      ? colors.success + '30'
                      : colors.danger + '30',
                    borderColor: isPositive ? colors.success : colors.danger,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isPositive ? colors.success : colors.danger },
                  ]}
                >
                  {md.meter.slice(0, 3).toUpperCase()}{' '}
                  {isPositive ? '+' : ''}
                  {md.delta}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.tapHint}>Tap to continue</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.default,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  arrow: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  choiceLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  diceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  diceLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  diceResult: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  narrative: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.6,
    marginBottom: spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  tapHint: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

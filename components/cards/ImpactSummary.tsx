/**
 * Sovereign -- ImpactSummary Component
 *
 * Post-decision outcome display shown after every swipe card commit.
 * Shows the chosen direction, choice label, optional dice result,
 * narrative text, and meter change chips. Auto-advances based on
 * text length or tap to skip.
 *
 * Auto-advance: max(3000, 2000 + words * 60) ms via useAutoAdvance.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY -- impact summary specification
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { Direction, DiceResult, MeterDelta } from '../../types';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ImpactSummaryProps {
  direction: Direction;
  label: string;
  diceResult?: DiceResult;
  narrative?: string;
  meterDeltas: MeterDelta[];
  onAdvance: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIRECTION_ARROWS: Record<Direction, string> = {
  up: '\u2191',    // up arrow
  down: '\u2193',  // down arrow
  left: '\u2190',  // left arrow
  right: '\u2192', // right arrow
};

const DIRECTION_COLORS: Record<Direction, string> = {
  up: colors.swipeUp,
  down: colors.swipeDown,
  left: colors.swipeLeft,
  right: colors.swipeRight,
};

const METER_COLORS: Record<string, string> = {
  authority: colors.authority,
  populace: colors.populace,
  treasury: colors.treasury,
  military: colors.military,
  stability: colors.stability,
};

const METER_LABELS: Record<string, string> = {
  authority: 'Authority',
  populace: 'Populace',
  treasury: 'Treasury',
  military: 'Military',
  stability: 'Stability',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImpactSummary({
  direction,
  label,
  diceResult,
  narrative,
  meterDeltas,
  onAdvance,
}: ImpactSummaryProps) {
  // Build the display text for auto-advance timing calculation
  const displayText = useMemo(() => {
    const parts: string[] = [label];
    if (narrative) parts.push(narrative);
    if (diceResult) parts.push(`Rolled ${diceResult.die}`);
    return parts.join(' ');
  }, [label, narrative, diceResult]);

  const { skip } = useAutoAdvance({
    text: displayText,
    baseMs: 3000,
    perWordMs: 60,
    onAdvance,
    enabled: true,
  });

  const handleTap = useCallback(() => {
    skip();
  }, [skip]);

  const dirColor = DIRECTION_COLORS[direction];
  const arrow = DIRECTION_ARROWS[direction];

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <Animated.View style={styles.content} entering={FadeIn.duration(400)}>
        {/* Direction arrow */}
        <Text style={[styles.arrow, { color: dirColor }]}>{arrow}</Text>

        {/* Choice label */}
        <Text style={styles.choiceLabel}>{label}</Text>

        {/* Dice result */}
        {diceResult && (
          <View style={styles.diceRow}>
            <Text style={styles.diceText}>
              Rolled {diceResult.die.toUpperCase()}: {diceResult.natural}
              {diceResult.modifier !== 0 && (
                <Text>
                  {' '}({diceResult.modifier > 0 ? '+' : ''}
                  {diceResult.modifier})
                </Text>
              )}
              {' '}= {diceResult.total}
            </Text>
            <View
              style={[
                styles.diceBadge,
                {
                  backgroundColor: diceResult.success
                    ? colors.success + '30'
                    : colors.error + '30',
                },
              ]}
            >
              <Text
                style={[
                  styles.diceBadgeText,
                  { color: diceResult.success ? colors.success : colors.error },
                ]}
              >
                {diceResult.critical && diceResult.success
                  ? 'CRIT!'
                  : diceResult.critical && !diceResult.success
                  ? 'CRIT FAIL'
                  : diceResult.success
                  ? 'Success'
                  : 'Failed'}
              </Text>
            </View>
          </View>
        )}

        {/* Narrative text */}
        {narrative ? (
          <Text style={styles.narrative}>{narrative}</Text>
        ) : null}

        {/* Meter delta chips */}
        {meterDeltas.length > 0 && (
          <View style={styles.meterRow}>
            {meterDeltas.map((delta, idx) => {
              const meterColor = METER_COLORS[delta.meter] ?? colors.textMuted;
              const meterLabel = METER_LABELS[delta.meter] ?? delta.meter;
              const sign = delta.amount > 0 ? '+' : '';

              return (
                <View
                  key={`${delta.meter}-${idx}`}
                  style={[styles.meterChip, { borderColor: meterColor + '60' }]}
                >
                  <Text style={[styles.meterChipText, { color: meterColor }]}>
                    {sign}{delta.amount} {meterLabel}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Tap hint */}
        <Text style={styles.tapHint}>Tap to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },

  content: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 340,
  },

  arrow: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  choiceLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  diceRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  diceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  diceBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  diceBadgeText: {
    ...typography.label,
    fontSize: 11,
  },

  narrative: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: spacing.sm,
  },

  meterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  meterChip: {
    borderWidth: 1,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },

  meterChipText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },

  tapHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xl,
    opacity: 0.5,
  },
});

export default ImpactSummary;

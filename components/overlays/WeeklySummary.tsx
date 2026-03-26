// ─── Weekly Summary Overlay ──────────────────────────────────────────────────
// Shows after every 3rd card (when week advances) with a recap of meter changes,
// district unrest warnings, and corruption level.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import type { MeterDelta, District } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeeklySummaryProps {
  /** Which week just completed */
  week: number;
  /** Net meter deltas accumulated during this week */
  meterDeltas: MeterDelta[];
  /** Current district states (to flag high unrest) */
  districts: District[];
  /** Current corruption level (0-100) */
  corruption: number;
  /** Called when the overlay should dismiss */
  onDismiss: () => void;
  /** Auto-dismiss delay in ms (default 4000) */
  autoDismissMs?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WeeklySummary({
  week,
  meterDeltas,
  districts,
  corruption,
  onDismiss,
  autoDismissMs = 4000,
}: WeeklySummaryProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dismissed = useRef(false);

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => onDismiss());
  };

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();

    // Auto-dismiss timer
    const timer = setTimeout(dismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, []);

  // Aggregate deltas by meter name (in case there are duplicates)
  const aggregated = meterDeltas.reduce<Record<string, number>>((acc, d) => {
    acc[d.meter] = (acc[d.meter] ?? 0) + d.delta;
    return acc;
  }, {});

  // Filter out zero-net deltas
  const chips = Object.entries(aggregated).filter(([, delta]) => delta !== 0);

  // Districts with unrest > 50
  const unrestDistricts = districts.filter((d) => d.unrest > 50);

  return (
    <TouchableWithoutFeedback onPress={dismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.header}>Week {week} Complete</Text>
          <View style={styles.divider} />

          {/* Meter deltas */}
          {chips.length > 0 ? (
            <View style={styles.chipsRow}>
              {chips.map(([meter, delta]) => {
                const positive = delta > 0;
                return (
                  <View
                    key={meter}
                    style={[
                      styles.chip,
                      { backgroundColor: positive ? '#28a74530' : '#dc354530' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: positive ? colors.success : colors.danger },
                      ]}
                    >
                      {positive ? '+' : ''}
                      {delta} {capitalize(meter)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noChanges}>No meter changes this week.</Text>
          )}

          {/* High unrest districts */}
          {unrestDistricts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>High Unrest</Text>
              {unrestDistricts.map((d) => (
                <Text key={d.id} style={styles.warningText}>
                  {d.name} — {d.unrest}% unrest
                </Text>
              ))}
            </View>
          )}

          {/* Corruption */}
          {corruption > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Corruption</Text>
              <Text style={styles.corruptionText}>
                Level {corruption} — {corruptionLabel(corruption)}
              </Text>
            </View>
          )}

          {/* Tap hint */}
          <Text style={styles.hint}>Tap to continue</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function corruptionLabel(level: number): string {
  if (level >= 60) return 'Rampant';
  if (level >= 30) return 'Spreading';
  return 'Festering';
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.xxl,
    marginHorizontal: spacing.xl,
    maxWidth: 360,
    width: '90%',
    alignItems: 'center',
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: colors.goldDim,
    marginVertical: spacing.md,
    borderRadius: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  noChanges: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  section: {
    width: '100%',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    marginBottom: spacing.xxs,
  },
  corruptionText: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});

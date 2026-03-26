// ─── MeterHeader ─────────────────────────────────────────────────────────────
// Sticky top header showing all 5 meters.
// Compact row mode (default) / expanded stack mode.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useGameStore } from '../../stores/gameStore';
import { MeterBar } from './MeterBar';
import type { MeterKey } from '../../types';

const METER_LABELS: Record<MeterKey, string> = {
  authority: 'AUT',
  populace: 'POP',
  treasury: 'TRS',
  military: 'MIL',
  stability: 'STB',
};

const METER_FULL_LABELS: Record<MeterKey, string> = {
  authority: 'Authority',
  populace: 'Populace',
  treasury: 'Treasury',
  military: 'Military',
  stability: 'Stability',
};

const METER_KEYS: MeterKey[] = ['authority', 'populace', 'treasury', 'military', 'stability'];

export function MeterHeader() {
  const meters = useGameStore((s) => s.meters);
  const week = useGameStore((s) => s.week);
  const act = useGameStore((s) => s.act);
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
      style={styles.container}
    >
      {/* Week indicator */}
      <View style={styles.weekRow}>
        <Text style={styles.weekText}>
          Act {act} — Week {week}
        </Text>
      </View>

      {expanded ? (
        // Expanded: vertical stack
        <View style={styles.expandedContainer}>
          {METER_KEYS.map((key) => (
            <View key={key} style={styles.expandedRow}>
              <Text style={[styles.meterLabel, { color: colors.meter[key] }]}>
                {METER_FULL_LABELS[key]}
              </Text>
              <View style={styles.expandedBarContainer}>
                <MeterBar meterKey={key} value={meters[key]} compact={false} />
              </View>
              <Text style={styles.meterValue}>{meters[key]}</Text>
            </View>
          ))}
        </View>
      ) : (
        // Compact: horizontal row
        <View style={styles.compactContainer}>
          {METER_KEYS.map((key) => (
            <View key={key} style={styles.compactItem}>
              <Text style={[styles.compactLabel, { color: colors.meter[key] }]}>
                {METER_LABELS[key]}
              </Text>
              <MeterBar meterKey={key} value={meters[key]} compact={true} />
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  weekRow: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  weekText: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactItem: {
    alignItems: 'center',
    gap: 2,
  },
  compactLabel: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  expandedContainer: {
    gap: spacing.sm,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meterLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    width: 70,
  },
  expandedBarContainer: {
    flex: 1,
  },
  meterValue: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    width: 28,
    textAlign: 'right',
  },
});

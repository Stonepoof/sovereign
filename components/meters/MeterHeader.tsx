// ─── MeterHeader ─────────────────────────────────────────────────────────────
// Sticky top header showing all 5 meters.
// Compact row mode (default) / expanded stack mode.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

  // Pulse animation for week indicator when week changes
  const weekPulse = useRef(new Animated.Value(0)).current;
  const prevWeekRef = useRef(week);

  useEffect(() => {
    if (prevWeekRef.current !== week) {
      prevWeekRef.current = week;
      weekPulse.setValue(1);
      Animated.timing(weekPulse, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [week, weekPulse]);

  const weekTextColor = weekPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.gold],
  });

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
      style={styles.container}
    >
      {/* Week indicator */}
      <View style={styles.weekRow}>
        <Animated.Text style={[styles.weekText, { color: weekTextColor }]}>
          Act {act} — Week {week}
        </Animated.Text>
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

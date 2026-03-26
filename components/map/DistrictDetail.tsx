// ─── DistrictDetail ──────────────────────────────────────────────────────────
// Stats panel for a selected district.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import type { District } from '../../types';

interface DistrictDetailProps {
  district: District;
}

function getUnrestLabel(unrest: number): { label: string; color: string } {
  if (unrest >= 70) return { label: 'CRITICAL', color: colors.danger };
  if (unrest >= 50) return { label: 'HIGH', color: colors.warning };
  if (unrest >= 30) return { label: 'MODERATE', color: '#f0ad4e' };
  return { label: 'LOW', color: colors.success };
}

export function DistrictDetail({ district }: DistrictDetailProps) {
  const unrestInfo = getUnrestLabel(district.unrest);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{district.name}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Population</Text>
          <Text style={styles.statValue}>{district.population.toLocaleString()}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statValue}>{district.income}g/week</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Unrest</Text>
          <Text style={[styles.statValue, { color: unrestInfo.color }]}>
            {district.unrest}%
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: unrestInfo.color }]}>
            {unrestInfo.label}
          </Text>
        </View>
      </View>

      {/* Unrest bar */}
      <View style={styles.unrestTrack}>
        <View
          style={[
            styles.unrestFill,
            {
              width: `${district.unrest}%`,
              backgroundColor: unrestInfo.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    width: '45%',
  },
  statLabel: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  unrestTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  unrestFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

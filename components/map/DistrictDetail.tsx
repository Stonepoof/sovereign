/**
 * Sovereign -- DistrictDetail
 *
 * Selected district stats panel showing below the map.
 * Displays name, icon, 3 stat bars (influence, unrest, prosperity),
 * and the district's narrative theme.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DistrictState } from '../../types';
import { DISTRICTS } from '../../data';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DistrictDetailProps {
  district: DistrictState;
}

// ---------------------------------------------------------------------------
// Stat Bar sub-component
// ---------------------------------------------------------------------------

function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={statStyles.row}>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.barContainer}>
        <View
          style={[
            statStyles.barFill,
            { width: `${Math.min(value, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    width: 70,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  value: {
    ...typography.caption,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DistrictDetail({ district }: DistrictDetailProps) {
  const def = DISTRICTS.find((d) => d.id === district.id);
  if (!def) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{def.icon}</Text>
        <Text style={styles.name}>{def.name}</Text>
      </View>

      {/* Stat Bars */}
      <StatBar label="Influence" value={district.influence} color={colors.populace} />
      <StatBar label="Unrest" value={district.unrest} color={colors.error} />
      <StatBar label="Prosperity" value={district.prosperity} color={colors.success} />

      {/* Description */}
      <Text style={styles.description}>{def.theme}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});

/**
 * Sovereign -- Map Tab
 *
 * Stub showing 5 district names with their unrest values.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDistrictStore } from '../../stores';
import { DISTRICTS } from '../../data';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function MapScreen() {
  const districts = useDistrictStore((s) => s.districts);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.header}>District Map</Text>
      <Text style={styles.subtitle}>
        Five districts form the heart of the kingdom
      </Text>

      {DISTRICTS.map((def) => {
        const state = districts[def.id];
        const unrestZone =
          state.unrest > 50 ? 'high' : state.unrest > 25 ? 'medium' : 'low';
        const unrestColor =
          unrestZone === 'high'
            ? colors.error
            : unrestZone === 'medium'
            ? colors.warning
            : colors.success;

        return (
          <View key={def.id} style={styles.districtCard}>
            <View style={styles.districtHeader}>
              <Text style={styles.districtIcon}>{def.icon}</Text>
              <Text style={styles.districtName}>{def.name}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>INFLUENCE</Text>
                <Text style={styles.statValue}>{state.influence}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>UNREST</Text>
                <Text style={[styles.statValue, { color: unrestColor }]}>
                  {state.unrest}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>PROSPERITY</Text>
                <Text style={styles.statValue}>{state.prosperity}</Text>
              </View>
            </View>
            <Text style={styles.theme}>{def.theme}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },
  header: {
    ...typography.h1,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  districtCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  districtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  districtIcon: {
    fontSize: 24,
  },
  districtName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.statLabel,
    color: colors.textMuted,
  },
  statValue: {
    ...typography.stat,
    color: colors.textPrimary,
    marginTop: 2,
  },
  theme: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

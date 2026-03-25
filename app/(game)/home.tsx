/**
 * Sovereign -- Home Tab
 *
 * Welcome screen showing current week/act info, trait display,
 * 5 meter summary, and a "Continue" button to navigate to cards.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore, useMeterStore } from '../../stores';
import { METERS } from '../../data';
import { MeterBar } from '../../components/meters/MeterBar';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const week = useGameStore((s) => s.week);
  const act = useGameStore((s) => s.act);
  const trait = useGameStore((s) => s.trait);
  const cardsPlayed = useGameStore((s) => s.cardsPlayed);
  const corruption = useGameStore((s) => s.corruption);
  const meters = useMeterStore((s) => s.meters);

  const traitLabel = trait
    ? trait.charAt(0).toUpperCase() + trait.slice(1)
    : 'Undetermined';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Week / Act header */}
      <Text style={styles.weekHeader}>
        Week {week} of 48 — Act {act}
      </Text>

      {/* Trait display */}
      <View style={styles.traitContainer}>
        <Text style={styles.traitLabel}>DEFINING TRAIT</Text>
        <Text style={styles.traitValue}>{traitLabel}</Text>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{cardsPlayed}</Text>
          <Text style={styles.statLabel}>CARDS PLAYED</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{corruption}</Text>
          <Text style={styles.statLabel}>CORRUPTION</Text>
        </View>
      </View>

      {/* 5 meter summary */}
      <View style={styles.metersSection}>
        <Text style={styles.sectionTitle}>Kingdom Status</Text>
        {METERS.map((m) => (
          <MeterBar
            key={m.name}
            name={m.name}
            value={meters[m.name]}
            icon={m.icon}
            label={m.label}
            color={m.color}
            compact={false}
          />
        ))}
      </View>

      {/* Continue button */}
      <Button
        title="Continue"
        onPress={() => router.push('/(game)/cards')}
        variant="primary"
        size="large"
        style={styles.continueButton}
      />
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
  weekHeader: {
    ...typography.h2,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  traitContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  traitLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  traitValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xxl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.stat,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.statLabel,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  metersSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  continueButton: {
    alignSelf: 'center',
    minWidth: 200,
  },
});

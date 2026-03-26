// ─── Home Tab ────────────────────────────────────────────────────────────────
// Week/act display, trait card, meter overview, "Continue" button.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { MeterBar } from '../../components/meters/MeterBar';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../stores/gameStore';
import type { MeterKey } from '../../types';

const METER_KEYS: MeterKey[] = ['authority', 'populace', 'treasury', 'military', 'stability'];
const METER_LABELS: Record<MeterKey, string> = {
  authority: 'Authority',
  populace: 'Populace',
  treasury: 'Treasury',
  military: 'Military',
  stability: 'Stability',
};

export default function HomeScreen() {
  const router = useRouter();
  const { week, act, trait, meters, selectedWorld } = useGameStore();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* World + Act info */}
      <View style={styles.header}>
        <Text style={styles.worldName}>
          {selectedWorld?.name ?? 'Unknown Realm'}
        </Text>
        <Text style={styles.actWeek}>
          Act {act} — Week {week}
        </Text>
      </View>

      {/* Trait card */}
      {trait && (
        <View style={styles.traitCard}>
          <Text style={styles.traitLabel}>DEFINING TRAIT</Text>
          <Text style={styles.traitName}>{trait.name}</Text>
          <Text style={styles.traitDesc}>{trait.description}</Text>
        </View>
      )}

      {/* Meter overview */}
      <View style={styles.metersSection}>
        <Text style={styles.sectionTitle}>Kingdom Status</Text>
        {METER_KEYS.map((key) => (
          <View key={key} style={styles.meterRow}>
            <Text style={[styles.meterLabel, { color: colors.meter[key] }]}>
              {METER_LABELS[key]}
            </Text>
            <View style={styles.meterBarContainer}>
              <MeterBar meterKey={key} value={meters[key]} />
            </View>
            <Text style={styles.meterValue}>{meters[key]}</Text>
          </View>
        ))}
      </View>

      {/* Continue button */}
      <Button
        label="Continue Ruling"
        onPress={() => router.push('/(game)/cards')}
        variant="primary"
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
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  worldName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  actWeek: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  traitCard: {
    backgroundColor: colors.card.origin,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gold,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  traitLabel: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.goldDim,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  traitName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  traitDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metersSection: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  meterLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    width: 80,
  },
  meterBarContainer: {
    flex: 1,
  },
  meterValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    width: 30,
    textAlign: 'right',
  },
  continueButton: {
    alignSelf: 'center',
  },
});

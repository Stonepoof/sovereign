/**
 * Sovereign -- Death Screen
 *
 * Game over screen with death narrative. Shows the meter that caused death,
 * a narrative explanation, and a "Try Again" button to restart.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore, useMeterStore, useUIStore, useCourtStore, useDistrictStore, useMemoryStore, useConversationStore, useCardStore } from '../../stores';
import { checkDeath, type DeathInfo } from '../../services/game/death-engine';
import { METERS } from '../../data';
import { Button } from '../ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { MeterName } from '../../types';

export default function DeathScreen() {
  const router = useRouter();
  const meters = useMeterStore((s) => s.meters);

  // Check which meter caused death
  const deathInfo = checkDeath(meters);

  // Find the meter definition for display
  const meterDef = deathInfo
    ? METERS.find((m) => m.name === deathInfo.meter)
    : null;

  const directionLabel = deathInfo?.direction === 'low' ? 'collapsed' : 'exceeded';

  const handleTryAgain = () => {
    // Reset all stores
    useGameStore.getState().resetGame();
    useMeterStore.getState().resetMeters();
    useUIStore.getState().reset();
    useCourtStore.getState().resetCourt();
    useDistrictStore.getState().resetDistricts();
    useMemoryStore.getState().reset();
    useConversationStore.getState().reset();
    useCardStore.getState().setCurrentCard(null);
    useCardStore.getState().clearImpact();

    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Skull */}
      <Text style={styles.skull}>💀</Text>

      {/* Death title */}
      <Text style={styles.title}>YOUR RULE HAS ENDED</Text>

      {/* Death cause */}
      {deathInfo && meterDef && (
        <View style={styles.causeContainer}>
          <Text style={styles.causeIcon}>{meterDef.icon}</Text>
          <Text style={styles.causeText}>
            {meterDef.label} {directionLabel}
          </Text>
        </View>
      )}

      {/* Narrative */}
      {deathInfo && (
        <View style={styles.narrativeContainer}>
          <Text style={styles.deathTitle}>
            {deathInfo.narrative.title}
          </Text>
          <Text style={styles.narrativeText} numberOfLines={5}>
            {deathInfo.narrative.narrative}
          </Text>
        </View>
      )}

      {/* Fallback if no death info (shouldn't happen) */}
      {!deathInfo && (
        <Text style={styles.narrativeText}>
          Your reign has come to an end through mysterious circumstances.
        </Text>
      )}

      {/* Try Again button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Try Again"
          onPress={handleTryAgain}
          variant="ghost"
          size="large"
          style={styles.tryAgainButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  skull: {
    fontSize: 60,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#dc3545',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing.xxl,
  },
  causeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  causeIcon: {
    fontSize: 24,
  },
  causeText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  narrativeContainer: {
    maxWidth: 320,
    marginBottom: spacing.xxxl,
  },
  deathTitle: {
    ...typography.h3,
    color: colors.textAccent,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  narrativeText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: spacing.massive,
    alignSelf: 'center',
  },
  tryAgainButton: {
    borderColor: colors.gold,
    minWidth: 180,
  },
});

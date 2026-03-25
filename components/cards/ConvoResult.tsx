/**
 * Sovereign -- ConvoResult
 *
 * Conversation summary display shown after completing all 3 beats.
 * Shows rapport score, loyalty change, meter effects.
 * Auto-dismisses after 2s or on tap.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import type { MeterEffects } from '../../types';
import { MAX_RAPPORT, RESULT_DISPLAY_MS, RAPPORT_COLORS } from '../../types/conversations';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConvoResultProps {
  rapport: number;
  npcId: string;
  npcName?: string;
  loyaltyChange: number;
  meterEffects: MeterEffects;
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRapportQuality(rapport: number): 'cold' | 'good' | 'excellent' {
  if (rapport <= 1) return 'cold';
  if (rapport <= 3) return 'good';
  return 'excellent';
}

const METER_COLORS: Record<string, string> = {
  authority: '#dc3545',
  populace: '#4a9eff',
  treasury: '#f0ad4e',
  military: '#28a745',
  stability: '#8b5cf6',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConvoResult({
  rapport,
  npcId,
  npcName,
  loyaltyChange,
  meterEffects,
  onDismiss,
}: ConvoResultProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(onDismiss, RESULT_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const quality = getRapportQuality(rapport);
  const rapportColor = RAPPORT_COLORS[quality];
  const rapportPercent = (rapport / MAX_RAPPORT) * 100;

  // Collect meter effect chips
  const meterChips = Object.entries(meterEffects).filter(([_, val]) => val !== 0);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onDismiss}
    >
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        {/* Title */}
        <Text style={styles.npcName}>{npcName ?? npcId}</Text>
        <Text style={styles.title}>Conversation Complete</Text>

        {/* Rapport Bar */}
        <View style={styles.rapportSection}>
          <Text style={styles.sectionLabel}>RAPPORT</Text>
          <View style={styles.rapportBarContainer}>
            <View
              style={[
                styles.rapportBarFill,
                {
                  width: `${rapportPercent}%`,
                  backgroundColor: rapportColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.rapportScore, { color: rapportColor }]}>
            {rapport}/{MAX_RAPPORT}
          </Text>
        </View>

        {/* Loyalty Change */}
        <View style={styles.loyaltySection}>
          <Text
            style={[
              styles.loyaltyText,
              {
                color: loyaltyChange >= 0 ? colors.success : colors.error,
              },
            ]}
          >
            {loyaltyChange >= 0 ? '+' : ''}
            {loyaltyChange} Loyalty
          </Text>
        </View>

        {/* Meter Effects */}
        {meterChips.length > 0 && (
          <View style={styles.meterChipsRow}>
            {meterChips.map(([meter, val]) => (
              <View
                key={meter}
                style={[
                  styles.meterChip,
                  {
                    backgroundColor: `${METER_COLORS[meter] ?? colors.textMuted}22`,
                    borderColor: METER_COLORS[meter] ?? colors.textMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.meterChipText,
                    { color: METER_COLORS[meter] ?? colors.textMuted },
                  ]}
                >
                  {(val as number) > 0 ? '+' : ''}
                  {val} {meter}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
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
    padding: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  npcName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },

  // Rapport
  rapportSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.statLabel,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  rapportBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  rapportBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rapportScore: {
    ...typography.bodySmall,
    fontWeight: '700',
    textAlign: 'right',
  },

  // Loyalty
  loyaltySection: {
    marginBottom: spacing.lg,
  },
  loyaltyText: {
    ...typography.h3,
    fontWeight: '700',
  },

  // Meter chips
  meterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  meterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  meterChipText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

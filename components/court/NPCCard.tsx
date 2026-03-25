/**
 * Sovereign -- NPCCard
 *
 * NPC roster item in the court tab. Shows portrait, name, role,
 * loyalty bar (colored by tier), faction badge, and dispatch status.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NPCState } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { FactionBadge } from './FactionBadge';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NPCCardProps {
  npc: NPCState;
  onPress?: () => void;
}

// ---------------------------------------------------------------------------
// Loyalty color by tier
// ---------------------------------------------------------------------------

function getLoyaltyColor(loyalty: number): string {
  if (loyalty >= 80) return '#ffd700'; // Devoted - gold
  if (loyalty >= 60) return '#28a745'; // Loyal - green
  if (loyalty >= 40) return '#888888'; // Neutral - gray
  if (loyalty >= 20) return '#f0ad4e'; // Disgruntled - orange
  return '#dc3545'; // Hostile - red
}

function getLoyaltyLabel(loyalty: number): string {
  if (loyalty >= 80) return 'Devoted';
  if (loyalty >= 60) return 'Loyal';
  if (loyalty >= 40) return 'Neutral';
  if (loyalty >= 20) return 'Disgruntled';
  return 'Hostile';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NPCCard({ npc, onPress }: NPCCardProps) {
  const loyaltyColor = getLoyaltyColor(npc.loy);
  const loyaltyPercent = Math.min(npc.loy, 100);

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...(wrapperProps as any)} style={styles.card}>
      <View style={styles.row}>
        {/* Portrait */}
        <Text style={styles.portrait}>{npc.portrait ?? '?'}</Text>

        {/* Name + Role */}
        <View style={styles.info}>
          <Text style={styles.name}>{npc.name}</Text>
          <Text style={styles.role}>{npc.role}</Text>
        </View>

        {/* Loyalty Bar */}
        <View style={styles.loyaltyContainer}>
          <View style={styles.loyaltyBarOuter}>
            <View
              style={[
                styles.loyaltyBarFill,
                {
                  width: `${loyaltyPercent}%`,
                  backgroundColor: loyaltyColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.loyaltyLabel, { color: loyaltyColor }]}>
            {getLoyaltyLabel(npc.loy)}
          </Text>
        </View>

        {/* Faction Badge */}
        {npc.faction && (
          <View style={styles.factionContainer}>
            <FactionBadge faction={npc.faction} />
          </View>
        )}
      </View>

      {/* Dispatched badge */}
      {npc.dispatched && (
        <View style={styles.dispatchedBadge}>
          <Text style={styles.dispatchedText}>DISPATCHED</Text>
        </View>
      )}
    </Wrapper>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portrait: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  role: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  loyaltyContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  loyaltyBarOuter: {
    width: 60,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  loyaltyBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  loyaltyLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factionContainer: {
    marginLeft: spacing.sm,
  },
  dispatchedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  dispatchedText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.info,
    letterSpacing: 0.5,
  },
});

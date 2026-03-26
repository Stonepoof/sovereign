// ─── NPCCard ─────────────────────────────────────────────────────────────────
// Portrait, name + role, loyalty bar, faction badge.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { FactionBadge } from './FactionBadge';
import type { NPC } from '../../types';

interface NPCCardProps {
  npc: NPC;
}

function getLoyaltyColor(loyalty: number): string {
  if (loyalty >= 70) return colors.success;
  if (loyalty >= 40) return colors.warning;
  return colors.danger;
}

export function NPCCard({ npc }: NPCCardProps) {
  const loyaltyColor = getLoyaltyColor(npc.loyalty);

  return (
    <View style={styles.card}>
      {/* Portrait */}
      <View style={styles.portrait}>
        <Text style={styles.portraitEmoji}>👤</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{npc.name}</Text>
        <Text style={styles.role}>{npc.role}</Text>

        {/* Loyalty bar */}
        <View style={styles.loyaltyRow}>
          <Text style={styles.loyaltyLabel}>Loyalty</Text>
          <View style={styles.loyaltyTrack}>
            <View
              style={[
                styles.loyaltyFill,
                {
                  width: `${npc.loyalty}%`,
                  backgroundColor: loyaltyColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.loyaltyValue, { color: loyaltyColor }]}>
            {npc.loyalty}
          </Text>
        </View>
      </View>

      {/* Faction badge */}
      <FactionBadge faction={npc.faction} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.md,
  },
  portrait: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  portraitEmoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  role: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  loyaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loyaltyLabel: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  loyaltyTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  loyaltyFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  loyaltyValue: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    width: 22,
    textAlign: 'right',
  },
});

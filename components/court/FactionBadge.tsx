// ─── FactionBadge ────────────────────────────────────────────────────────────
// Colored pill badge for faction display.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import type { FactionId } from '../../types';

interface FactionBadgeProps {
  faction: FactionId;
}

const FACTION_COLORS: Partial<Record<FactionId, string>> = {
  crown: colors.gold,
  merchant: colors.meter.treasury,
  military: colors.meter.military,
  faith: '#e879f9',
  shadow: '#8b5cf6',
};

const FACTION_LABELS: Partial<Record<FactionId, string>> = {
  crown: 'Crown',
  merchant: 'Merchant',
  military: 'Military',
  faith: 'Faith',
  shadow: 'Shadow',
};

export function FactionBadge({ faction }: FactionBadgeProps) {
  const color = FACTION_COLORS[faction] ?? colors.textMuted;

  return (
    <View style={[styles.badge, { backgroundColor: color + '30', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>
        {FACTION_LABELS[faction] ?? faction}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

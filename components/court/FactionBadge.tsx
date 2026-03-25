/**
 * Sovereign -- FactionBadge
 *
 * Small pill/chip showing a faction name with faction-specific color.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FactionId } from '../../types';
import { borderRadius, spacing } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FactionBadgeProps {
  faction: FactionId;
}

// ---------------------------------------------------------------------------
// Color map
// ---------------------------------------------------------------------------

const FACTION_COLORS: Record<FactionId, string> = {
  reform: '#4a9eff',
  military: '#28a745',
  populist: '#f0ad4e',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FactionBadge({ faction }: FactionBadgeProps) {
  const color = FACTION_COLORS[faction] ?? '#888888';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>
        {faction.charAt(0).toUpperCase() + faction.slice(1)}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

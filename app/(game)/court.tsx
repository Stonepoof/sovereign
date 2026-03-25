/**
 * Sovereign -- Court Tab
 *
 * Shows recruited NPCs with loyalty values.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCourtStore } from '../../stores';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function CourtScreen() {
  const npcs = useCourtStore((s) => s.npcs);
  const recruited = npcs.filter((n) => n.recruited);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.header}>Your Court</Text>
      <Text style={styles.subtitle}>
        {recruited.length > 0
          ? `${recruited.length} advisor${recruited.length !== 1 ? 's' : ''} in your service`
          : 'No advisors recruited yet'}
      </Text>

      {recruited.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👑</Text>
          <Text style={styles.emptyText}>
            Play cards to recruit NPCs to your court. Each advisor brings unique
            abilities and faction connections.
          </Text>
        </View>
      )}

      {recruited.map((npc) => {
        const loyaltyColor =
          npc.loy >= 70
            ? colors.success
            : npc.loy >= 40
            ? colors.warning
            : colors.error;

        return (
          <View key={npc.name} style={styles.npcCard}>
            <View style={styles.npcHeader}>
              <Text style={styles.npcPortrait}>{npc.portrait ?? '👤'}</Text>
              <View style={styles.npcInfo}>
                <Text style={styles.npcName}>{npc.name}</Text>
                <Text style={styles.npcRole}>{npc.role}</Text>
                {npc.faction && (
                  <Text style={styles.npcFaction}>{npc.faction}</Text>
                )}
              </View>
              <View style={styles.loyaltyContainer}>
                <Text style={styles.loyaltyLabel}>LOYALTY</Text>
                <Text style={[styles.loyaltyValue, { color: loyaltyColor }]}>
                  {npc.loy}
                </Text>
              </View>
            </View>
            {npc.dispatched && (
              <Text style={styles.dispatchedBadge}>DISPATCHED</Text>
            )}
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
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  npcCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  npcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  npcPortrait: {
    fontSize: 36,
  },
  npcInfo: {
    flex: 1,
  },
  npcName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  npcRole: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  npcFaction: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
  },
  loyaltyContainer: {
    alignItems: 'center',
  },
  loyaltyLabel: {
    ...typography.statLabel,
    color: colors.textMuted,
  },
  loyaltyValue: {
    ...typography.stat,
    marginTop: 2,
  },
  dispatchedBadge: {
    ...typography.label,
    color: colors.info,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
});

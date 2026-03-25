/**
 * Sovereign -- Court Tab
 *
 * Shows the player's recruited NPC roster using NPCCard components,
 * with a separate section for NPCs available to recruit.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCourtStore, useGameStore } from '../../stores';
import { NPCS } from '../../data';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { NPCCard } from '../../components/court/NPCCard';

export default function CourtScreen() {
  const npcs = useCourtStore((s) => s.npcs);
  const week = useGameStore((s) => s.week);

  const recruited = npcs.filter((n) => n.recruited);

  // NPCs whose recruitWeek has passed but who haven't been recruited yet.
  // Match NPC state back to NPCDef to check recruitWeek.
  const available = npcs.filter((n) => {
    if (n.recruited) return false;
    const def = NPCS.find((d) => d.name === n.name);
    // If no recruitWeek defined, treat as not yet available
    if (!def || def.recruitWeek === undefined) return false;
    return week >= def.recruitWeek;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Text style={styles.header}>Your Court</Text>
      <Text style={styles.subtitle}>
        {recruited.length > 0
          ? `${recruited.length} advisor${recruited.length !== 1 ? 's' : ''} in your service`
          : 'No advisors recruited yet'}
      </Text>

      {/* Empty State */}
      {recruited.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👑</Text>
          <Text style={styles.emptyText}>
            Play cards to recruit NPCs to your court. Each advisor brings unique
            abilities and faction connections.
          </Text>
        </View>
      )}

      {/* Recruited NPCs */}
      {recruited.map((npc) => (
        <NPCCard key={npc.name} npc={npc} />
      ))}

      {/* Available to Recruit */}
      {available.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Available to Recruit</Text>
          <Text style={styles.sectionSubtitle}>
            These NPCs can be recruited through gameplay
          </Text>
          {available.map((npc) => (
            <NPCCard key={npc.name} npc={npc} />
          ))}
        </View>
      )}
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
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
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
  section: {
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.textAccent,
    marginBottom: spacing.xxs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});

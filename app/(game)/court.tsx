// ─── Court Tab ───────────────────────────────────────────────────────────────
// NPC roster (recruited) + recruit section (unrecruited).

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { NPCCard } from '../../components/court/NPCCard';
import { Button } from '../../components/ui/Button';
import { useGameStore } from '../../stores/gameStore';

export default function CourtScreen() {
  const npcs = useGameStore((s) => s.npcs);
  const recruitNPC = useGameStore((s) => s.recruitNPC);

  const recruited = npcs.filter((n) => n.recruited);
  const available = npcs.filter((n) => !n.recruited);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Royal Court</Text>

      {/* Recruited NPCs */}
      <Text style={styles.sectionTitle}>Your Council</Text>
      <View style={styles.npcList}>
        {recruited.map((npc) => (
          <NPCCard key={npc.id} npc={npc} />
        ))}
        {recruited.length === 0 && (
          <Text style={styles.emptyText}>No advisors yet</Text>
        )}
      </View>

      {/* Available to recruit */}
      {available.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Available to Recruit</Text>
          <View style={styles.npcList}>
            {available.map((npc) => (
              <View key={npc.id}>
                <NPCCard npc={npc} />
                <Button
                  label="Recruit"
                  onPress={() => recruitNPC(npc.id)}
                  variant="secondary"
                  style={styles.recruitButton}
                />
              </View>
            ))}
          </View>
        </>
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
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  npcList: {
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.xl,
  },
  recruitButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
  },
});

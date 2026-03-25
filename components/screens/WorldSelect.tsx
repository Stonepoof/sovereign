/**
 * Sovereign -- World Select Screen
 *
 * First screen: shows 3 world cards in a column.
 * Vael is unlocked, others are locked.
 * Tapping an unlocked world sets it in game-store and navigates to the game.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../stores';
import { WORLDS } from '../../data';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export default function WorldSelect() {
  const router = useRouter();
  const setWorld = useGameStore((s) => s.setWorld);
  const setPhase = useGameStore((s) => s.setPhase);

  const handleSelectWorld = (worldId: string) => {
    setWorld(worldId);
    setPhase('origin');
    router.replace('/(game)/home');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Title */}
      <Text style={styles.title}>SOVEREIGN</Text>
      <Text style={styles.subtitle}>Choose Your Realm</Text>

      {/* World cards */}
      {WORLDS.map((world) => (
        <TouchableOpacity
          key={world.id}
          style={[
            styles.worldCard,
            world.locked && styles.worldCardLocked,
          ]}
          onPress={() => !world.locked && handleSelectWorld(world.id)}
          disabled={world.locked}
          activeOpacity={0.8}
        >
          {/* Lock overlay */}
          {world.locked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}

          <View style={styles.worldHeader}>
            <Text style={styles.worldIcon}>{world.icon}</Text>
            <View style={styles.worldTitleArea}>
              <Text
                style={[
                  styles.worldName,
                  world.locked && styles.worldNameLocked,
                ]}
              >
                {world.name}
              </Text>
              <View
                style={[
                  styles.settingBadge,
                  { backgroundColor: world.color + '20' },
                ]}
              >
                <Text style={[styles.settingText, { color: world.color }]}>
                  {world.setting}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={[
              styles.worldDescription,
              world.locked && styles.worldDescriptionLocked,
            ]}
          >
            {world.description}
          </Text>

          {!world.locked && (
            <Text style={styles.playPrompt}>Tap to begin</Text>
          )}
        </TouchableOpacity>
      ))}
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
    paddingTop: spacing.massive,
    paddingBottom: spacing.massive,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  worldCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  worldCardLocked: {
    opacity: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: borderRadius.xl,
  },
  lockIcon: {
    fontSize: 40,
    opacity: 0.7,
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  worldIcon: {
    fontSize: 40,
  },
  worldTitleArea: {
    flex: 1,
  },
  worldName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  worldNameLocked: {
    color: colors.textMuted,
  },
  settingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  settingText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  worldDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  worldDescriptionLocked: {
    color: colors.textMuted,
  },
  playPrompt: {
    ...typography.label,
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

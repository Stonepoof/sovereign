// ─── WorldSelect ─────────────────────────────────────────────────────────────
// "SOVEREIGN" gold title, 3 world cards, tap to navigate.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import type { World } from '../../types';

interface WorldSelectProps {
  onSelectWorld: (world: World) => void;
}

const WORLDS: World[] = [
  {
    id: 'medieval',
    name: 'The Crumbling Throne',
    description: 'A kingdom on the brink of civil war. Rival factions vie for your favor as crops fail and enemies gather at the borders.',
    theme: 'Medieval Fantasy',
    color: colors.gold,
  },
  {
    id: 'scifi',
    name: 'Station Meridian',
    description: 'A space station at the crossroads of trade routes. Corporate espionage, alien diplomacy, and a failing reactor demand your attention.',
    theme: 'Sci-Fi',
    color: colors.info,
  },
  {
    id: 'noir',
    name: 'Ashmore City',
    description: 'A rain-soaked metropolis ruled by crime lords and corrupt politicians. Your precinct is the last line between order and chaos.',
    theme: 'Noir',
    color: colors.meter.stability,
  },
];

export function WorldSelect({ onSelectWorld }: WorldSelectProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 30,
        friction: 7,
      }),
    ]).start();
  }, [fadeAnim, titleScale]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Title */}
      <Animated.View style={{ transform: [{ scale: titleScale }] }}>
        <Text style={styles.title}>SOVEREIGN</Text>
        <Text style={styles.subtitle}>Choose Your World</Text>
      </Animated.View>

      {/* World cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {WORLDS.map((world) => (
          <TouchableOpacity
            key={world.id}
            onPress={() => onSelectWorld(world)}
            activeOpacity={0.8}
            style={[styles.worldCard, { borderColor: world.color }]}
          >
            <Text style={styles.themeBadge}>{world.theme}</Text>
            <Text style={[styles.worldName, { color: world.color }]}>
              {world.name}
            </Text>
            <Text style={styles.worldDescription}>{world.description}</Text>
            <Text style={[styles.playLabel, { color: world.color }]}>
              TAP TO BEGIN →
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 80,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.heavy,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  worldCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
  },
  themeBadge: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  worldName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  worldDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.6,
    marginBottom: spacing.md,
  },
  playLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    textAlign: 'right',
  },
});

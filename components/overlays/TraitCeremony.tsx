// ─── TraitCeremony ───────────────────────────────────────────────────────────
// Scale-in overlay, "DEFINING TRAIT" header, 3-second auto-dismiss.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import type { Trait } from '../../types';

interface TraitCeremonyProps {
  trait: Trait;
  onDismiss: () => void;
}

export function TraitCeremony({ trait, onDismiss }: TraitCeremonyProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(onDismiss);
    }, 3000);

    return () => clearTimeout(timer);
  }, [scaleAnim, fadeAnim, onDismiss]);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.content,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.label}>DEFINING TRAIT</Text>
        <Text style={styles.divider}>✦ ✦ ✦</Text>
        <Text style={styles.traitName}>{trait.name}</Text>
        <Text style={styles.description}>{trait.description}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  content: {
    backgroundColor: colors.card.origin,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
    maxWidth: 320,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  divider: {
    fontSize: fontSize.md,
    color: colors.goldDim,
    marginBottom: spacing.lg,
  },
  traitName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.heavy,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.6,
  },
});

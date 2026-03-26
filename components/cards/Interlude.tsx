// ─── Interlude ───────────────────────────────────────────────────────────────
// Auto-advancing interlude card. Italic text, "INTERLUDE" label.

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';

interface InterludeProps {
  narrative: string;
  onAdvance: () => void;
}

export function Interlude({ narrative, onAdvance }: InterludeProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { skip } = useAutoAdvance({
    text: narrative,
    baseMs: 4000,
    perWordMs: 200,
    onAdvance,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  return (
    <TouchableOpacity onPress={skip} activeOpacity={0.9}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.label}>INTERLUDE</Text>
        <Text style={styles.divider}>───</Text>
        <Text style={styles.narrative}>{narrative}</Text>
        <Text style={styles.tapHint}>Tap to continue</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.interlude,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    margin: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.goldDim,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  divider: {
    fontSize: fontSize.sm,
    color: colors.goldMuted,
    marginBottom: spacing.lg,
  },
  narrative: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: fontSize.md * 1.8,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },
  tapHint: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
  },
});

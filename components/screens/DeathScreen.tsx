// ─── DeathScreen ─────────────────────────────────────────────────────────────
// Skull emoji, "YOUR RULE HAS ENDED", narrative text, "Try Again" button.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Button } from '../ui/Button';

interface DeathScreenProps {
  narrative: string;
  week: number;
  onRetry: () => void;
}

export function DeathScreen({ narrative, week, onRetry }: DeathScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const skullScale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.spring(skullScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 30,
        friction: 5,
      }),
    ]).start();
  }, [fadeAnim, skullScale]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.Text
        style={[styles.skull, { transform: [{ scale: skullScale }] }]}
      >
        💀
      </Animated.Text>

      <Text style={styles.title}>YOUR RULE HAS ENDED</Text>
      <Text style={styles.weekText}>
        You lasted {week} {week === 1 ? 'week' : 'weeks'}
      </Text>

      <Text style={styles.narrative}>{narrative}</Text>

      <Button label="Try Again" onPress={onRetry} variant="primary" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  skull: {
    fontSize: 80,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.heavy,
    color: colors.danger,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  weekText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },
  narrative: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: fontSize.md * 1.7,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    maxWidth: 320,
  },
});

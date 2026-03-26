// ─── ConvoResult ─────────────────────────────────────────────────────────────
// Rapport bar, loyalty change, 2-second auto-dismiss.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface ConvoResultProps {
  npcName: string;
  rapport: number;
  loyaltyChange: number;
  onDismiss: () => void;
}

export function ConvoResult({ npcName, rapport, loyaltyChange, onDismiss }: ConvoResultProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onDismiss]);

  const isPositive = loyaltyChange >= 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.title}>CONVERSATION COMPLETE</Text>

      {/* Rapport bar */}
      <View style={styles.rapportSection}>
        <Text style={styles.label}>Final Rapport</Text>
        <View style={styles.rapportTrack}>
          <View
            style={[
              styles.rapportFill,
              {
                width: `${rapport}%`,
                backgroundColor:
                  rapport >= 60 ? colors.success : rapport >= 30 ? colors.warning : colors.danger,
              },
            ]}
          />
        </View>
        <Text style={styles.rapportValue}>{rapport}%</Text>
      </View>

      {/* Loyalty change */}
      <View style={styles.loyaltyRow}>
        <Text style={styles.npcName}>{npcName}</Text>
        <Text
          style={[
            styles.loyaltyDelta,
            { color: isPositive ? colors.success : colors.danger },
          ]}
        >
          {isPositive ? '+' : ''}
          {loyaltyChange} Loyalty
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.default,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    margin: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: spacing.xl,
  },
  rapportSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  rapportTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  rapportFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  rapportValue: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  loyaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  npcName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  loyaltyDelta: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

// ─── Policy Tab (Placeholder) ────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function PolicyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Policy</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.description}>
        Enact kingdom-wide policies that shape your realm. Manage taxes,
        trade agreements, military doctrine, and social reforms.
      </Text>
      <Text style={styles.lockIcon}>📜</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.6,
    maxWidth: 300,
    marginBottom: spacing.xxl,
  },
  lockIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
});

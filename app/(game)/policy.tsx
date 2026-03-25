/**
 * Sovereign -- Policy Tab
 *
 * Stub with placeholder for policy system.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function PolicyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Policies</Text>
      <Text style={styles.subtitle}>Shape the laws of your kingdom</Text>

      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📜</Text>
        <Text style={styles.emptyText}>
          Policy system unlocks as you progress through your reign. Enact decrees
          that shift the balance of power across all five meters.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
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
});

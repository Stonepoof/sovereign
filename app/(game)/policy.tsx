// ─── Policy Tab ──────────────────────────────────────────────────────────
// Shows active policies — decisions the player has made with ongoing effects.
// Grouped by category: Economic, Military, Social.

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useMemoryStore } from '../../stores/memory-store';
import { PolicyRecord, PolicyCategory } from '../../types';
import {
  groupPoliciesByCategory,
  POLICY_CATEGORY_ORDER,
  POLICY_CATEGORY_ICONS,
  directionLabel,
  formatMeterEffect,
} from '../../utils/policy-helpers';

// ─── Meter Effect Chip ──────────────────────────────────────────────────────

function MeterChip({ meter, delta }: { meter: string; delta: number }) {
  const isPositive = delta >= 0;
  const chipColor = isPositive ? colors.success : colors.danger;

  return (
    <View style={[styles.chip, { borderColor: chipColor }]}>
      <Text style={[styles.chipText, { color: chipColor }]}>
        {formatMeterEffect(meter, delta)}
      </Text>
    </View>
  );
}

// ─── Single Policy Card ─────────────────────────────────────────────────────

function PolicyCard({ policy }: { policy: PolicyRecord }) {
  return (
    <View style={styles.policyCard}>
      <View style={styles.policyHeader}>
        <Text style={styles.policyTitle} numberOfLines={1}>
          {policy.cardTitle}
        </Text>
        <Text style={styles.policyWeek}>Week {policy.week}</Text>
      </View>

      <View style={styles.policyChoice}>
        <View style={[styles.directionBadge, { backgroundColor: getDirectionColor(policy.direction) }]}>
          <Text style={styles.directionText}>
            {directionLabel(policy.direction)}
          </Text>
        </View>
        <Text style={styles.choiceLabel} numberOfLines={2}>
          {policy.choiceLabel}
        </Text>
      </View>

      <View style={styles.effectsRow}>
        {Object.entries(policy.meterEffects).map(([meter, delta]) => (
          <MeterChip key={meter} meter={meter} delta={delta} />
        ))}
      </View>
    </View>
  );
}

// ─── Category Section ───────────────────────────────────────────────────────

function CategorySection({
  category,
  policies,
}: {
  category: PolicyCategory;
  policies: PolicyRecord[];
}) {
  if (policies.length === 0) return null;

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>
          {POLICY_CATEGORY_ICONS[category]}
        </Text>
        <Text style={styles.categoryTitle}>{category}</Text>
        <Text style={styles.categoryCount}>{policies.length}</Text>
      </View>
      {policies.map((policy, index) => (
        <PolicyCard key={`${policy.cardId}-${index}`} policy={policy} />
      ))}
    </View>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📜</Text>
      <Text style={styles.emptyTitle}>No Active Policies</Text>
      <Text style={styles.emptyDescription}>
        Your decisions will shape the kingdom. Swipe on cards to enact policies
        that have lasting effects on your realm.
      </Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function PolicyScreen() {
  const policies = useMemoryStore((s) => s._policies);

  const grouped = useMemo(() => groupPoliciesByCategory(policies), [policies]);

  const totalPolicies = policies.length;

  if (totalPolicies === 0) {
    return (
      <View style={styles.container}>
        <EmptyState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Active Policies</Text>
          <Text style={styles.totalBadge}>{totalPolicies}</Text>
        </View>
        <Text style={styles.screenSubtitle}>
          Decisions shaping your reign
        </Text>

        {POLICY_CATEGORY_ORDER.map((category) => (
          <CategorySection
            key={category}
            category={category}
            policies={grouped[category]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDirectionColor(direction: string): string {
  switch (direction) {
    case 'left': return colors.swipe.left + '30';
    case 'right': return colors.swipe.right + '30';
    case 'up': return colors.swipe.up + '30';
    case 'down': return colors.swipe.down + '30';
    default: return colors.surfaceLight;
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  screenTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
  totalBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.background,
    backgroundColor: colors.gold,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  screenSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },

  // Category
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldMuted,
  },
  categoryIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  categoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gold,
    flex: 1,
  },
  categoryCount: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },

  // Policy Card
  policyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  policyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  policyWeek: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },

  // Choice row
  policyChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  directionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  directionText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  choiceLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: fontSize.sm * 1.4,
  },

  // Effects
  effectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  chipText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.semibold,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    opacity: 0.5,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.6,
    maxWidth: 300,
  },
});

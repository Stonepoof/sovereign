// ─── Shop Tab — Royal Treasury ──────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useGameStore, useMeterStore } from '../../stores';
import type { MeterEffects } from '../../types';

// ─── Shop Item Definitions ──────────────────────────────────────────────────

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
  effects: MeterEffects;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'royal_decree',
    name: 'Royal Decree',
    icon: '\u{1F4DC}',
    cost: 100,
    description: 'Issue a formal decree that strengthens your rule.',
    effects: { authority: 5 },
  },
  {
    id: 'merchants_gift',
    name: "Merchant's Gift",
    icon: '\u{1F4B0}',
    cost: 150,
    description: 'A generous trade deal fills the royal coffers.',
    effects: { treasury: 5 },
  },
  {
    id: 'peoples_festival',
    name: "People's Festival",
    icon: '\u{1F389}',
    cost: 200,
    description: 'Fund a grand festival for the common folk. The treasury takes a hit.',
    effects: { populace: 5, treasury: -3 },
  },
  {
    id: 'military_levy',
    name: 'Military Levy',
    icon: '\u{2694}\u{FE0F}',
    cost: 250,
    description: 'Conscript and equip new soldiers. The people grumble.',
    effects: { military: 5, populace: -3 },
  },
];

// ─── Toast Component ────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

// ─── Shop Item Card ─────────────────────────────────────────────────────────

function ShopItemCard({
  item,
  gold,
  onPurchase,
}: {
  item: ShopItem;
  gold: number;
  onPurchase: (item: ShopItem) => void;
}) {
  const canAfford = gold >= item.cost;

  const effectText = Object.entries(item.effects)
    .map(([meter, delta]) => {
      const sign = delta > 0 ? '+' : '';
      return `${sign}${delta} ${meter}`;
    })
    .join(', ');

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemIcon}>{item.icon}</Text>
        <View style={styles.itemTitleBlock}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCost}>
            {'\u{1FA99}'} {item.cost} gold
          </Text>
        </View>
      </View>

      <Text style={styles.itemDescription}>{item.description}</Text>
      <Text style={styles.itemEffects}>{effectText}</Text>

      <Pressable
        style={[styles.purchaseBtn, !canAfford && styles.purchaseBtnDisabled]}
        onPress={() => canAfford && onPurchase(item)}
        disabled={!canAfford}
      >
        <Text
          style={[
            styles.purchaseBtnText,
            !canAfford && styles.purchaseBtnTextDisabled,
          ]}
        >
          {canAfford ? 'Purchase' : 'Not enough gold'}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Shop Screen ────────────────────────────────────────────────────────────

export default function ShopScreen() {
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const spendGold = useGameStore((s) => s.spendGold);
  const applyMeters = useMeterStore((s) => s.applyMeters);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handlePurchase = useCallback(
    (item: ShopItem) => {
      const success = spendGold(item.cost);
      if (success) {
        applyMeters(item.effects);
        setToastMessage(`${item.icon} ${item.name} acquired!`);
        setToastVisible(true);
      }
    },
    [spendGold, applyMeters],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>{'\u{1F451}'} Royal Treasury</Text>

        {/* Currency Display */}
        <View style={styles.currencyRow}>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyIcon}>{'\u{1FA99}'}</Text>
            <Text style={styles.currencyValue}>{gold}</Text>
            <Text style={styles.currencyLabel}>Gold</Text>
          </View>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyIcon}>{'\u{1F48E}'}</Text>
            <Text style={styles.currencyValue}>{gems}</Text>
            <Text style={styles.currencyLabel}>Gems</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Shop Items */}
        <Text style={styles.sectionTitle}>Royal Goods</Text>
        {SHOP_ITEMS.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            gold={gold}
            onPurchase={handlePurchase}
          />
        ))}
      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },

  // Header
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  // Currency display
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.xs,
  },
  currencyIcon: {
    fontSize: fontSize.lg,
  },
  currencyValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
  currencyLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.lg,
  },

  // Section
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  // Item card
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  itemTitleBlock: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  itemCost: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gold,
    marginTop: spacing.xxs,
  },
  itemDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.5,
    marginBottom: spacing.sm,
  },
  itemEffects: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.info,
    marginBottom: spacing.md,
  },

  // Purchase button
  purchaseBtn: {
    backgroundColor: colors.goldMuted,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  purchaseBtnDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  purchaseBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  purchaseBtnTextDisabled: {
    color: colors.textDisabled,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: spacing.xxl,
    right: spacing.xxl,
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  toastText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});

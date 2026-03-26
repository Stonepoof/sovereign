// ─── TabBar ──────────────────────────────────────────────────────────────────
// 6 tabs with progressive unlock, gold active indicator.

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { TabConfig } from '../../types';

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: '🏰', unlockWeek: 0 },
  { key: 'cards', label: 'Cards', icon: '🃏', unlockWeek: 0 },
  { key: 'map', label: 'Map', icon: '🗺', unlockWeek: 3 },
  { key: 'court', label: 'Court', icon: '👑', unlockWeek: 5 },
  { key: 'policy', label: 'Policy', icon: '📜', unlockWeek: 8 },
  { key: 'shop', label: 'Shop', icon: '🏪', unlockWeek: 12 },
];

interface TabBarProps {
  activeTab: string;
  unlockedTabs: string[];
  onTabPress: (key: string) => void;
}

export function TabBar({ activeTab, unlockedTabs, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isUnlocked = unlockedTabs.includes(tab.key);
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => isUnlocked && onTabPress(tab.key)}
            disabled={!isUnlocked}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, !isUnlocked && styles.locked]}>
              {isUnlocked ? tab.icon : '🔒'}
            </Text>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                !isUnlocked && styles.locked,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeBar} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingBottom: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    position: 'relative',
  },
  tabActive: {},
  icon: {
    fontSize: fontSize.xl,
    marginBottom: 2,
  },
  label: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  labelActive: {
    color: colors.gold,
    fontWeight: fontWeight.semibold,
  },
  locked: {
    opacity: 0.3,
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 1,
  },
});

/**
 * Sovereign -- Custom TabBar
 *
 * Fixed bottom tab bar with progressive unlock. Tabs are unlocked via
 * the ui-store. Locked tabs appear grayed out and are not tappable.
 * Active tab is highlighted with gold tint.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUIStore } from '../../stores';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Tab Definitions
// ---------------------------------------------------------------------------

interface TabDef {
  key: string;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'cards', label: 'Cards', icon: '🃏' },
  { key: 'map', label: 'Map', icon: '🗺️' },
  { key: 'court', label: 'Court', icon: '👑' },
  { key: 'policy', label: 'Policy', icon: '📜' },
  { key: 'shop', label: 'Shop', icon: '💰' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TabBarProps {
  state: any;
  navigation: any;
  descriptors: any;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TabBar({ state, navigation, descriptors }: TabBarProps) {
  const _tabs = useUIStore((s) => s._tabs);
  const unlockedTabs = new Set(_tabs);

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const tabDef = TABS.find((t) => t.key === route.name);
        if (!tabDef) return null;

        const isFocused = state.index === index;
        const isUnlocked = unlockedTabs.has(tabDef.key);

        const onPress = () => {
          if (!isUnlocked) return;

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            disabled={!isUnlocked}
            style={styles.tab}
            activeOpacity={isUnlocked ? 0.7 : 1}
          >
            <Text
              style={[
                styles.icon,
                !isUnlocked && styles.locked,
                isFocused && isUnlocked && styles.active,
              ]}
            >
              {tabDef.icon}
            </Text>
            <Text
              style={[
                styles.label,
                !isUnlocked && styles.lockedLabel,
                isFocused && isUnlocked && styles.activeLabel,
              ]}
            >
              {tabDef.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: layout.bottomNavHeight,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 20,
    opacity: 0.7,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  active: {
    opacity: 1,
  },
  activeLabel: {
    color: colors.gold,
  },
  locked: {
    opacity: 0.3,
  },
  lockedLabel: {
    opacity: 0.3,
    color: colors.textMuted,
  },
});

export default TabBar;

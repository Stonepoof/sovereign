/**
 * Sovereign -- Game Tab Layout
 *
 * Main game layout with 6 tabs: home, cards, map, court, policy, shop.
 * Uses custom TabBar with progressive unlock via ui-store.
 * MeterHeader is rendered as a sticky top element above the tab content.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { TabBar } from '../../components/ui/TabBar';
import { MeterBar } from '../../components/meters/MeterBar';
import { useMeterStore } from '../../stores';
import { METERS } from '../../data';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

function MeterHeader() {
  const meters = useMeterStore((s) => s.meters);

  return (
    <View style={styles.meterHeader}>
      {METERS.map((m) => (
        <MeterBar
          key={m.name}
          name={m.name}
          value={meters[m.name]}
          icon={m.icon}
          color={m.color}
          compact
        />
      ))}
    </View>
  );
}

export default function GameLayout() {
  return (
    <View style={styles.container}>
      <MeterHeader />
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ title: 'Home' }}
        />
        <Tabs.Screen
          name="cards"
          options={{ title: 'Cards' }}
        />
        <Tabs.Screen
          name="map"
          options={{ title: 'Map' }}
        />
        <Tabs.Screen
          name="court"
          options={{ title: 'Court' }}
        />
        <Tabs.Screen
          name="policy"
          options={{ title: 'Policy' }}
        />
        <Tabs.Screen
          name="shop"
          options={{ title: 'Shop' }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingTop: 52, // safe area top offset
    backgroundColor: colors.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});

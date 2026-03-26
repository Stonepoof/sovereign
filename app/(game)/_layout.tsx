// ─── Game Layout ─────────────────────────────────────────────────────────────
// MeterHeader (sticky top) + tab content + TabBar (bottom).
// Uses Expo Router Tabs but with custom TabBar.

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { colors } from '../../theme/colors';
import { MeterHeader } from '../../components/meters/MeterHeader';
import { TabBar } from '../../components/ui/TabBar';
import { useGameStore } from '../../stores/gameStore';

const TAB_ROUTES: Record<string, string> = {
  home: '/(game)/home',
  cards: '/(game)/cards',
  map: '/(game)/map',
  court: '/(game)/court',
  policy: '/(game)/policy',
  shop: '/(game)/shop',
};

export default function GameLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const unlockedTabs = useGameStore((s) => s.unlockedTabs);

  // Determine active tab from pathname
  const activeTab = Object.entries(TAB_ROUTES).find(
    ([, route]) => pathname.includes(route.split('/').pop()!)
  )?.[0] ?? 'cards';

  const handleTabPress = useCallback(
    (key: string) => {
      const route = TAB_ROUTES[key];
      if (route) {
        router.push(route as any);
      }
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <MeterHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="cards" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="court" />
        <Tabs.Screen name="policy" />
        <Tabs.Screen name="shop" />
      </Tabs>
      <TabBar
        activeTab={activeTab}
        unlockedTabs={unlockedTabs}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

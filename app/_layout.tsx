/**
 * Sovereign -- Root Layout
 *
 * Wraps the entire app in GestureHandlerRootView for swipe support.
 * Defines the root Stack with world_select (index), game tabs, and death screen.
 */

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(game)" />
        <Stack.Screen name="death" />
      </Stack>
    </GestureHandlerRootView>
  );
}

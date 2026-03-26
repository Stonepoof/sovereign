// ─── Index (World Select) ────────────────────────────────────────────────────

import React from 'react';
import { useRouter } from 'expo-router';
import { WorldSelect } from '../components/screens/WorldSelect';
import { useGameStore } from '../stores/gameStore';
import type { World } from '../types';

export default function IndexScreen() {
  const router = useRouter();
  const selectWorld = useGameStore((s) => s.selectWorld);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleSelectWorld = (world: World) => {
    resetGame();
    selectWorld(world);
    router.replace('/(game)/cards');
  };

  return <WorldSelect onSelectWorld={handleSelectWorld} />;
}

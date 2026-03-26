// ─── Death Screen Route ──────────────────────────────────────────────────────

import React from 'react';
import { useRouter } from 'expo-router';
import { DeathScreen } from '../components/screens/DeathScreen';
import { useGameStore } from '../stores/gameStore';

export default function DeathRoute() {
  const router = useRouter();
  const deathNarrative = useGameStore((s) => s.deathNarrative);
  const week = useGameStore((s) => s.week);

  const handleRetry = () => {
    router.replace('/');
  };

  return (
    <DeathScreen
      narrative={deathNarrative || 'Your reign has come to an end. The kingdom remembers your choices.'}
      week={week}
      onRetry={handleRetry}
    />
  );
}

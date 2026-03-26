// ─── Game Store ───────────────────────────────────────────────────────────
// Core game state: phase, world, week progression (1-48), trait, corruption.
// 48-week reign across 4 acts.

import { create } from 'zustand';
import { GamePhase, DefiningTrait, WorldDef } from '../types';

function weekToAct(week: number): number {
  if (week <= 12) return 1;
  if (week <= 24) return 2;
  if (week <= 36) return 3;
  return 4;
}

interface GameStoreState {
  phase: GamePhase;
  worldId: string;
  week: number;
  act: number;
  trait: DefiningTrait | null;
  corruption: number;
  cardsPlayed: string[];
  originComplete: boolean;

  setPhase: (phase: GamePhase) => void;
  setWorldId: (id: string) => void;
  advanceWeek: () => void;
  setTrait: (trait: DefiningTrait) => void;
  addCorruption: (delta: number) => void;
  recordCardPlayed: (cardId: string) => void;
  completeOrigin: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  phase: 'origin',
  worldId: '',
  week: 1,
  act: 1,
  trait: null,
  corruption: 0,
  cardsPlayed: [],
  originComplete: false,

  setPhase: (phase) => set({ phase }),

  setWorldId: (id) => set({ worldId: id }),

  advanceWeek: () => {
    const next = Math.min(get().week + 1, 48);
    set({ week: next, act: weekToAct(next) });
  },

  setTrait: (trait) => set({ trait }),

  addCorruption: (delta) => {
    const next = Math.max(0, Math.min(100, get().corruption + delta));
    set({ corruption: next });
  },

  recordCardPlayed: (cardId) =>
    set((s) => ({ cardsPlayed: [...s.cardsPlayed, cardId] })),

  completeOrigin: () => set({ originComplete: true, phase: 'gameplay' }),

  resetGame: () =>
    set({
      phase: 'origin',
      worldId: '',
      week: 1,
      act: 1,
      trait: null,
      corruption: 0,
      cardsPlayed: [],
      originComplete: false,
    }),
}));

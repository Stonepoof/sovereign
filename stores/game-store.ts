/**
 * Sovereign -- Master Game State Store
 *
 * Tracks the top-level game phase, week/act progression, corruption,
 * player trait, and origin completion state.
 *
 * Week-to-act mapping: 1-16 = Act 1, 17-32 = Act 2, 33-48 = Act 3.
 */

import { create } from 'zustand';
import type { GamePhase, Act, DefiningTrait, GameState, GameTab } from '../types';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void;
  setWorld: (worldId: string) => void;
  advanceWeek: () => void;
  setTrait: (trait: DefiningTrait) => void;
  addCorruption: (amount: number) => void;
  incrementCardsPlayed: () => void;
  completeOrigin: () => void;
  resetGame: () => void;
  getAct: () => Act;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function weekToAct(week: number): Act {
  if (week <= 16) return 1;
  if (week <= 32) return 2;
  return 3;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const INITIAL_STATE: GameState = {
  phase: 'world_select',
  worldId: 'vael',
  week: 1,
  act: 1,
  trait: null,
  corruption: 0,
  cardsPlayed: 0,
  originComplete: false,
  originCardIndex: 0,
  activeTab: 'home' as GameTab,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,

  setPhase: (phase) => set({ phase }),

  setWorld: (worldId) => set({ worldId }),

  advanceWeek: () =>
    set((state) => {
      const nextWeek = Math.min(state.week + 1, 48);
      return {
        week: nextWeek,
        act: weekToAct(nextWeek),
      };
    }),

  setTrait: (trait) => set({ trait }),

  addCorruption: (amount) =>
    set((state) => ({
      corruption: clamp(state.corruption + amount, 0, 100),
    })),

  incrementCardsPlayed: () =>
    set((state) => ({ cardsPlayed: state.cardsPlayed + 1 })),

  completeOrigin: () =>
    set({
      originComplete: true,
      phase: 'playing',
    }),

  resetGame: () => set({ ...INITIAL_STATE }),

  getAct: () => weekToAct(get().week),
}));

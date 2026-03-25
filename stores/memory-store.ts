/**
 * Sovereign -- Memory Store
 *
 * Tracks narrative flags, player choices, witnessed events (dramatic irony),
 * and played card IDs. Uses arrays internally for Zustand serialization
 * while exposing a Set-like API.
 */

import { create } from 'zustand';
import type { Choice } from '../types';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface MemoryStore {
  /** Internal array backing for flags. */
  _flags: string[];
  /** Internal array backing for witnessed events. */
  _witnessed: string[];
  /** Internal array backing for played card IDs. */
  _cardsPlayed: string[];
  /** Ordered list of player choices. */
  choices: Choice[];

  // Actions
  addFlags: (...flags: string[]) => void;
  hasFlag: (flag: string) => boolean;
  addChoice: (choice: Choice) => void;
  addWitnessed: (eventId: string) => void;
  markCardPlayed: (cardId: string) => void;
  hasPlayed: (cardId: string) => boolean;

  /** Returns flags as a Set (convenience for card conditions). */
  getFlags: () => Set<string>;
  /** Returns witnessed as a Set. */
  getWitnessed: () => Set<string>;
  /** Returns cardsPlayed as a Set. */
  getCardsPlayed: () => Set<string>;

  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  _flags: [],
  _witnessed: [],
  _cardsPlayed: [],
  choices: [],

  addFlags: (...flags) =>
    set((state) => {
      const existing = new Set(state._flags);
      const newFlags = flags.filter((f) => !existing.has(f));
      if (newFlags.length === 0) return state;
      return { _flags: [...state._flags, ...newFlags] };
    }),

  hasFlag: (flag) => get()._flags.includes(flag),

  addChoice: (choice) =>
    set((state) => ({ choices: [...state.choices, choice] })),

  addWitnessed: (eventId) =>
    set((state) => {
      if (state._witnessed.includes(eventId)) return state;
      return { _witnessed: [...state._witnessed, eventId] };
    }),

  markCardPlayed: (cardId) =>
    set((state) => {
      if (state._cardsPlayed.includes(cardId)) return state;
      return { _cardsPlayed: [...state._cardsPlayed, cardId] };
    }),

  hasPlayed: (cardId) => get()._cardsPlayed.includes(cardId),

  getFlags: () => new Set(get()._flags),
  getWitnessed: () => new Set(get()._witnessed),
  getCardsPlayed: () => new Set(get()._cardsPlayed),

  reset: () =>
    set({
      _flags: [],
      _witnessed: [],
      _cardsPlayed: [],
      choices: [],
    }),
}));

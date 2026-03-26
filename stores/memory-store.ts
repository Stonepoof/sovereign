// ─── Memory Store ─────────────────────────────────────────────────────────
// Tracks flags, choices, witnessed events, cards played, and enacted policies.
// Provides Set-like API for efficient lookups.

import { create } from 'zustand';
import { PolicyRecord } from '../types';

interface MemoryStoreState {
  _flags: string[];
  _choices: string[];
  _witnessed: string[];
  _cardsPlayed: string[];
  _policies: PolicyRecord[];

  // Flag operations
  setFlag: (flag: string) => void;
  hasFlag: (flag: string) => boolean;
  removeFlag: (flag: string) => void;
  clearFlags: () => void;

  // Choice tracking
  recordChoice: (choiceId: string) => void;
  hasChosen: (choiceId: string) => boolean;

  // Witnessed events
  witness: (eventId: string) => void;
  hasWitnessed: (eventId: string) => boolean;

  // Card tracking
  recordCard: (cardId: string) => void;
  hasPlayedCard: (cardId: string) => boolean;
  getCardsPlayedCount: () => number;

  // Policy tracking
  enactPolicy: (policy: PolicyRecord) => void;
  getPolicies: () => PolicyRecord[];

  // Bulk
  resetMemory: () => void;
}

export const useMemoryStore = create<MemoryStoreState>((set, get) => ({
  _flags: [],
  _choices: [],
  _witnessed: [],
  _cardsPlayed: [],
  _policies: [],

  setFlag: (flag) => {
    if (!get()._flags.includes(flag)) {
      set((s) => ({ _flags: [...s._flags, flag] }));
    }
  },

  hasFlag: (flag) => get()._flags.includes(flag),

  removeFlag: (flag) =>
    set((s) => ({ _flags: s._flags.filter((f) => f !== flag) })),

  clearFlags: () => set({ _flags: [] }),

  recordChoice: (choiceId) => {
    if (!get()._choices.includes(choiceId)) {
      set((s) => ({ _choices: [...s._choices, choiceId] }));
    }
  },

  hasChosen: (choiceId) => get()._choices.includes(choiceId),

  witness: (eventId) => {
    if (!get()._witnessed.includes(eventId)) {
      set((s) => ({ _witnessed: [...s._witnessed, eventId] }));
    }
  },

  hasWitnessed: (eventId) => get()._witnessed.includes(eventId),

  recordCard: (cardId) => {
    if (!get()._cardsPlayed.includes(cardId)) {
      set((s) => ({ _cardsPlayed: [...s._cardsPlayed, cardId] }));
    }
  },

  hasPlayedCard: (cardId) => get()._cardsPlayed.includes(cardId),

  getCardsPlayedCount: () => get()._cardsPlayed.length,

  enactPolicy: (policy) =>
    set((s) => ({ _policies: [...s._policies, policy] })),

  getPolicies: () => get()._policies,

  resetMemory: () =>
    set({ _flags: [], _choices: [], _witnessed: [], _cardsPlayed: [], _policies: [] }),
}));

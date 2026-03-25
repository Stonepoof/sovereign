/**
 * Sovereign -- Conversation Store
 *
 * Tracks the active 3-beat conversation state: which NPC, current beat,
 * accumulated rapport. endConversation returns the final rapport and NPC
 * for loyalty calculation.
 */

import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface ConversationStore {
  active: boolean;
  npcId: string | null;
  beatIndex: number;
  rapport: number;

  startConversation: (npcId: string) => void;
  advanceBeat: () => void;
  addRapport: (amount: number) => void;
  endConversation: () => { rapport: number; npcId: string };
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useConversationStore = create<ConversationStore>((set, get) => ({
  active: false,
  npcId: null,
  beatIndex: 0,
  rapport: 0,

  startConversation: (npcId) =>
    set({
      active: true,
      npcId,
      beatIndex: 0,
      rapport: 0,
    }),

  advanceBeat: () =>
    set((state) => ({
      beatIndex: Math.min(state.beatIndex + 1, 2),
    })),

  addRapport: (amount) =>
    set((state) => ({
      rapport: Math.min(state.rapport + amount, 6),
    })),

  endConversation: () => {
    const { rapport, npcId } = get();
    const result = {
      rapport,
      npcId: npcId ?? '',
    };
    set({
      active: false,
      npcId: null,
      beatIndex: 0,
      rapport: 0,
    });
    return result;
  },

  reset: () =>
    set({
      active: false,
      npcId: null,
      beatIndex: 0,
      rapport: 0,
    }),
}));

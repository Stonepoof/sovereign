// ─── Conversation Store ───────────────────────────────────────────────────
// Manages active NPC conversation state: beats, rapport (max 6).

import { create } from 'zustand';
import { ConversationBeat } from '../types';

const MAX_RAPPORT = 6;

interface ConversationStoreState {
  active: boolean;
  npcId: string | null;
  beatIndex: number;
  rapport: number;
  beats: ConversationBeat[];

  startConversation: (npcId: string, beats: ConversationBeat[]) => void;
  advanceBeat: () => void;
  adjustRapport: (delta: number) => void;
  endConversation: () => void;
  resetConversation: () => void;
}

export const useConversationStore = create<ConversationStoreState>((set, get) => ({
  active: false,
  npcId: null,
  beatIndex: 0,
  rapport: 0,
  beats: [],

  startConversation: (npcId, beats) =>
    set({
      active: true,
      npcId,
      beatIndex: 0,
      rapport: 0,
      beats,
    }),

  advanceBeat: () => {
    const { beatIndex, beats } = get();
    if (beatIndex < beats.length - 1) {
      set({ beatIndex: beatIndex + 1 });
    }
  },

  adjustRapport: (delta) => {
    const next = Math.max(0, Math.min(MAX_RAPPORT, get().rapport + delta));
    set({ rapport: next });
  },

  endConversation: () =>
    set({ active: false }),

  resetConversation: () =>
    set({
      active: false,
      npcId: null,
      beatIndex: 0,
      rapport: 0,
      beats: [],
    }),
}));

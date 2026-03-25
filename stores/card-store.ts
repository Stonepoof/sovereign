/**
 * Sovereign -- Card Store
 *
 * Manages the currently displayed card, a queue of follow-up card IDs,
 * and the post-swipe impact summary overlay.
 */

import { create } from 'zustand';
import type { Card, InterludeCard, ConversationCard, ImpactSummary } from '../types';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface CardStore {
  currentCard: Card | InterludeCard | ConversationCard | null;
  cardQueue: string[];
  impact: ImpactSummary | null;

  setCurrentCard: (card: Card | InterludeCard | ConversationCard | null) => void;
  queueFollowUp: (cardId: string) => void;
  dequeueFollowUp: () => string | null;
  setImpact: (impact: ImpactSummary | null) => void;
  clearImpact: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCardStore = create<CardStore>((set, get) => ({
  currentCard: null,
  cardQueue: [],
  impact: null,

  setCurrentCard: (card) => set({ currentCard: card }),

  queueFollowUp: (cardId) =>
    set((state) => ({ cardQueue: [...state.cardQueue, cardId] })),

  dequeueFollowUp: () => {
    const { cardQueue } = get();
    if (cardQueue.length === 0) return null;

    const [next, ...rest] = cardQueue;
    set({ cardQueue: rest });
    return next;
  },

  setImpact: (impact) => set({ impact }),

  clearImpact: () => set({ impact: null }),
}));

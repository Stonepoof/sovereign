// ─── Card Store ───────────────────────────────────────────────────────────
// Tracks the current card, card queue, and last impact.

import { create } from 'zustand';
import { Card, InterludeCard, ConversationCard, MeterEffects, Direction } from '../types';

export type AnyCard = Card | InterludeCard | ConversationCard;

export interface CardImpact {
  cardId: string;
  choiceLabel: string;
  direction: Direction;
  effects: MeterEffects;
}

interface CardStoreState {
  currentCard: AnyCard | null;
  cardQueue: AnyCard[];
  impact: CardImpact | null;

  setCurrentCard: (card: AnyCard | null) => void;
  enqueue: (card: AnyCard) => void;
  enqueueFront: (card: AnyCard) => void;
  dequeue: () => AnyCard | null;
  setImpact: (impact: CardImpact | null) => void;
  clearQueue: () => void;
  resetCards: () => void;
}

export const useCardStore = create<CardStoreState>((set, get) => ({
  currentCard: null,
  cardQueue: [],
  impact: null,

  setCurrentCard: (card) => set({ currentCard: card }),

  enqueue: (card) =>
    set((s) => ({ cardQueue: [...s.cardQueue, card] })),

  enqueueFront: (card) =>
    set((s) => ({ cardQueue: [card, ...s.cardQueue] })),

  dequeue: () => {
    const { cardQueue } = get();
    if (cardQueue.length === 0) return null;
    const [next, ...rest] = cardQueue;
    set({ cardQueue: rest, currentCard: next });
    return next;
  },

  setImpact: (impact) => set({ impact }),

  clearQueue: () => set({ cardQueue: [] }),

  resetCards: () =>
    set({ currentCard: null, cardQueue: [], impact: null }),
}));

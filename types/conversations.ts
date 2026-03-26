// ─── Conversation Types ───────────────────────────────────────────────────
// Re-exports from cards.ts for convenience, plus conversation-specific types.

export type { ConversationBeat, ConversationCard } from './cards';

/** Conversation state tracker */
export interface ConversationState {
  cardId: string;
  npcId: string;
  currentBeat: number;
  totalBeats: number;
  completed: boolean;
  choicesMade: number[];
}

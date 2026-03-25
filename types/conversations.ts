/**
 * Sovereign — Conversation Encounter Types
 *
 * Conversations are 3-beat visual novel segments within the card stream.
 * They use portrait + dialogue + tap-to-select instead of swipe.
 * Each conversation builds rapport, affects NPC loyalty, and can shift meters/flags.
 *
 * Rapport scoring: 0, 1, or 2 points per beat. Max 6 across 3 beats.
 * Loyalty bonus: perRapport * totalRapport.
 *
 * @see SOV_PRD_06_CONVERSATIONS — data model, state machine, rapport system
 */

import type { MeterEffects } from './meters';

// ---------------------------------------------------------------------------
// Conversation State
// ---------------------------------------------------------------------------

/**
 * Runtime state for an active conversation encounter.
 * Tracks beat progress and accumulated rapport.
 */
export interface ConversationState {
  /** Whether a conversation is currently active. */
  active: boolean;

  /** NPC identifier for the active conversation (null if none active). */
  npcId: string | null;

  /** NPC display name. */
  npcName: string | null;

  /** Current beat index (0, 1, or 2). */
  beatIndex: number;

  /** Total number of beats (always 3). */
  totalBeats: 3;

  /** Accumulated rapport from chosen responses. */
  rapport: number;

  /** Maximum possible rapport (6 = 2 per beat * 3 beats). */
  maxRapport: 6;

  /** Whether the NPC reaction text is currently being shown. */
  showingReaction: boolean;

  /** Accumulated meter effects from chosen responses. */
  accumulatedMeters: MeterEffects;
}

// ---------------------------------------------------------------------------
// Conversation Phase State Machine
// ---------------------------------------------------------------------------

/**
 * States for the conversation state machine.
 *
 * BEAT_SHOWING   -> player sees NPC dialogue + response options
 * RESPONSE_SHOWN -> player tapped option, NPC reaction displayed (2.2s delay)
 * COMPLETE       -> all 3 beats finished, calculating results
 * RESULT_SHOWN   -> summary displayed (2s), then week advances
 */
export type ConversationPhase =
  | 'beat_showing'
  | 'response_shown'
  | 'complete'
  | 'result_shown';

// ---------------------------------------------------------------------------
// Rapport Quality
// ---------------------------------------------------------------------------

/**
 * Quality tier based on total rapport accumulated.
 *
 * | Rapport | Quality   | Visual            | Loyalty Effect           |
 * |---------|-----------|-------------------|--------------------------|
 * | 0-1     | cold      | Bar empty, dim    | perRapport * rapport     |
 * | 2-3     | good      | Bar half, accent  | perRapport * rapport     |
 * | 4-6     | excellent | Bar full, green   | perRapport * rapport     |
 */
export type RapportQuality = 'cold' | 'good' | 'excellent';

/**
 * Rapport quality thresholds.
 */
export const RAPPORT_THRESHOLDS = {
  cold: { min: 0, max: 1 },
  good: { min: 2, max: 3 },
  excellent: { min: 4, max: 6 },
} as const;

/** Maximum rapport achievable in a single conversation. */
export const MAX_RAPPORT = 6;

/** Total beats per conversation. */
export const BEATS_PER_CONVERSATION = 3;

/** Delay in ms after selecting a response before next beat appears. */
export const REACTION_DELAY_MS = 2200;

/** Duration in ms to show the conversation result summary. */
export const RESULT_DISPLAY_MS = 2000;

// ---------------------------------------------------------------------------
// Conversation Injection
// ---------------------------------------------------------------------------

/**
 * Conversations are injected by the card selector every Nth card.
 * This constant defines the injection interval.
 */
export const CONVERSATION_INJECTION_INTERVAL = 6;

// ---------------------------------------------------------------------------
// Rapport Bar Colors
// ---------------------------------------------------------------------------

/**
 * Color mapping for the rapport bar based on quality tier.
 */
export const RAPPORT_COLORS: Record<RapportQuality, string> = {
  cold: '#666666',
  good: '#c9a55a',
  excellent: '#28a745',
};

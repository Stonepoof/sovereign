/**
 * Sovereign — Card Selector
 *
 * The 5-priority queue that decides which card to show next.
 * This is the game's intelligence — it orchestrates pacing, variety,
 * and tension by selecting from follow-ups, conversations, interludes,
 * district crises, and base cards.
 *
 * Priority order (highest first):
 * 1. Follow-ups: If cardQueue has entries, dequeue and play next.
 * 2. Conversations: Every 6th card, inject a conversation card (if available).
 * 3. Interludes: Every 8th card, inject an interlude (if condition met).
 * 4. District cards: If any district has unrest > threshold AND random check passes.
 * 5. Base cards: Random from pool whose conditions are met and haven't been played (if once: true).
 *
 * All functions are pure (aside from Math.random for shuffling/probability).
 *
 * @see SOV_PRD_07_NARRATIVE_ENGINE — card selector specification, priority system
 */

import type {
  Card,
  InterludeCard,
  ConversationCard,
  TextContext,
  ConditionFn,
  DefiningTrait,
  Act,
  NPCState,
  MeterName,
} from '../../types';
import type { DistrictState } from '../../types';
import type { Memory } from '../../types';
import {
  BASE_CARDS,
  CRISIS_CARDS,
  DISTRICT_CARDS,
  INTERLUDE_CARDS,
  CONVERSATION_CARDS,
  FOLLOWUP_CARDS,
} from '../../data/cards';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Conversation injection interval: every Nth card. */
const CONVERSATION_INTERVAL = 6;

/** Interlude injection interval: every Nth card. */
const INTERLUDE_INTERVAL = 8;

/** District crisis unrest threshold. */
const DISTRICT_UNREST_THRESHOLD = 50;

/** District card probability scaling by act. */
const DISTRICT_PROBABILITY: Record<Act, number> = {
  1: 0.15,
  2: 0.30,
  3: 0.50,
};

// ---------------------------------------------------------------------------
// Selector Context
// ---------------------------------------------------------------------------

/**
 * Context required by the card selector to make its decision.
 */
export interface CardSelectorContext {
  /** Total cards played this term. */
  cardsPlayed: number;

  /** Queue of follow-up card IDs to play next. */
  cardQueue: string[];

  /** Set of card IDs already played this term. */
  playedCards: Set<string>;

  /** Current week (1-48). */
  week: number;

  /** Current act (1, 2, or 3). */
  act: 1 | 2 | 3;

  /** Narrative flags set by past decisions. */
  flags: Set<string>;

  /** Current meter values keyed by meter name. */
  meters: Record<string, number>;

  /** All NPC states in the game. */
  npcs: NPCState[];

  /** District states keyed by DistrictId. */
  districts: Record<string, DistrictState>;

  /** Player's defining trait (null during early origin). */
  trait: DefiningTrait | null;

  /** Current corruption score (0-100). */
  corruption: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a TextContext from the CardSelectorContext for evaluating ConditionFn.
 */
function buildTextContext(ctx: CardSelectorContext): TextContext {
  const memory: Memory = {
    flags: ctx.flags,
    choices: [],
    witnessed: new Set(),
    cardsPlayed: ctx.playedCards,
  };

  return {
    memory,
    npcs: ctx.npcs,
    trait: ctx.trait,
    week: ctx.week,
    act: ctx.act,
    corruption: ctx.corruption,
    meters: ctx.meters,
  };
}

/**
 * Check whether a card's condition is met.
 * If no condition exists, the card is always eligible.
 */
function meetsCondition(condition: ConditionFn | undefined, textCtx: TextContext): boolean {
  if (!condition) return true;
  try {
    return condition(textCtx);
  } catch {
    // Condition errored — treat as not met (fail closed)
    return false;
  }
}

/**
 * Filter cards to those that are eligible based on:
 * - Condition function passes
 * - Not already played (if once: true)
 */
function filterEligible<T extends { id: string; condition?: ConditionFn; once?: boolean }>(
  cards: T[],
  textCtx: TextContext,
  playedCards: Set<string>,
): T[] {
  return cards.filter((card) => {
    // Skip once-cards that have already been played
    if (card.once && playedCards.has(card.id)) return false;

    // Check condition
    return meetsCondition(card.condition, textCtx);
  });
}

/**
 * Pick a random element from an array, or return null if empty.
 */
function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)] ?? null;
}

// ---------------------------------------------------------------------------
// Core Selector
// ---------------------------------------------------------------------------

/**
 * Select the next card to show the player.
 *
 * Evaluates the 5-priority queue in order and returns the first match.
 * Returns null only if no cards are available at all (game content exhaustion).
 *
 * @param ctx - The full game context needed for selection.
 * @returns The selected card (Card, InterludeCard, or ConversationCard), or null.
 */
export function selectNextCard(ctx: CardSelectorContext): Card | InterludeCard | ConversationCard | null {
  const textCtx = buildTextContext(ctx);

  // ── Priority 1: Follow-ups ──────────────────────────────────────────────
  if (ctx.cardQueue.length > 0) {
    const nextId = ctx.cardQueue[0];
    // Search all card collections for the follow-up ID
    const followUp = findCardById(nextId);
    if (followUp) return followUp;
    // If follow-up card not found, fall through to next priority
  }

  // ── Priority 2: Conversations (every 6th card) ─────────────────────────
  if (ctx.cardsPlayed > 0 && ctx.cardsPlayed % CONVERSATION_INTERVAL === 0) {
    const eligible = filterEligibleConversations(ctx, textCtx);
    const conversation = pickRandom(eligible);
    if (conversation) return conversation;
  }

  // ── Priority 3: Interludes (every 8th card) ─────────────────────────────
  if (ctx.cardsPlayed > 0 && ctx.cardsPlayed % INTERLUDE_INTERVAL === 0) {
    const eligible = filterEligible(INTERLUDE_CARDS, textCtx, ctx.playedCards);
    const interlude = pickRandom(eligible);
    if (interlude) return interlude;
  }

  // ── Priority 4: District cards ──────────────────────────────────────────
  const districtCard = selectDistrictCard(ctx, textCtx);
  if (districtCard) return districtCard;

  // ── Priority 5: Base cards ──────────────────────────────────────────────
  const allBaseCards = [...BASE_CARDS, ...CRISIS_CARDS];
  const eligible = filterEligible(allBaseCards, textCtx, ctx.playedCards);
  return pickRandom(eligible);
}

// ---------------------------------------------------------------------------
// Sub-selectors
// ---------------------------------------------------------------------------

/**
 * Find a card by ID across all card collections.
 */
function findCardById(id: string): Card | InterludeCard | ConversationCard | null {
  // Search follow-up cards first (most likely target)
  const followUp = FOLLOWUP_CARDS.find((c) => c.id === id);
  if (followUp) return followUp;

  // Search base cards
  const base = BASE_CARDS.find((c) => c.id === id);
  if (base) return base;

  // Search crisis cards
  const crisis = CRISIS_CARDS.find((c) => c.id === id);
  if (crisis) return crisis;

  // Search district cards
  const district = DISTRICT_CARDS.find((c) => c.id === id);
  if (district) return district;

  // Search interludes
  const interlude = INTERLUDE_CARDS.find((c) => c.id === id);
  if (interlude) return interlude;

  // Search conversations
  const conversation = CONVERSATION_CARDS.find((c) => c.id === id);
  if (conversation) return conversation;

  return null;
}

/**
 * Filter conversation cards to those eligible:
 * - Condition passes
 * - The NPC has been recruited
 * - Not already played (conversations can repeat, but not in sequence)
 */
function filterEligibleConversations(
  ctx: CardSelectorContext,
  textCtx: TextContext,
): ConversationCard[] {
  return CONVERSATION_CARDS.filter((card) => {
    // Check condition
    if (!meetsCondition(card.condition, textCtx)) return false;

    // NPC must be recruited
    const npc = ctx.npcs.find((n) => n.name === card.npcId || n.name === card.npcName);
    if (!npc || !npc.recruited) return false;

    // Don't repeat the same conversation if it was just played
    if (ctx.playedCards.has(card.id)) return false;

    return true;
  });
}

/**
 * Select a district crisis card if conditions are met:
 * - Any district has unrest > 50
 * - Random check passes (probability scales by act)
 */
function selectDistrictCard(
  ctx: CardSelectorContext,
  textCtx: TextContext,
): Card | null {
  // Find districts in crisis
  const crisisDistricts: string[] = [];
  for (const [id, state] of Object.entries(ctx.districts)) {
    if (state.unrest > DISTRICT_UNREST_THRESHOLD) {
      // Probability check scaled by act
      const probability = DISTRICT_PROBABILITY[ctx.act] ?? 0.15;
      if (Math.random() < probability) {
        crisisDistricts.push(id);
      }
    }
  }

  if (crisisDistricts.length === 0) return null;

  // Pick a random crisis district
  const targetDistrict = crisisDistricts[Math.floor(Math.random() * crisisDistricts.length)];

  // Find eligible district cards for this district
  const eligible = DISTRICT_CARDS.filter((card) => {
    // Card must target this district (via districtReq or tags)
    const matchesDistrict =
      (card.districtReq && card.districtReq.id === targetDistrict) ||
      (card.tags && card.tags.includes(targetDistrict!));

    if (!matchesDistrict) return false;

    // Standard eligibility checks
    if (card.once && ctx.playedCards.has(card.id)) return false;
    return meetsCondition(card.condition, textCtx);
  });

  return pickRandom(eligible);
}

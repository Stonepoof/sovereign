/**
 * Sovereign — Onboarding Engine
 *
 * Manages the 8-card origin sequence state machine with progressive
 * disclosure of meters, tabs, and trait assignment.
 *
 * The onboarding IS the gameplay. No tutorials. No popups. Character creation
 * happens through diegetic flashbacks interleaved with present-tense decisions.
 *
 * Pattern: REAL -> FLASH -> REAL -> FLASH -> WORLD -> REACTION -> ALLIANCE -> FINALE
 *
 * All functions are pure — no side effects, no mutations.
 *
 * @see SOV_PRD_08_ONBOARDING — card-by-card specification, progressive disclosure
 */

import type { Card, MeterName } from '../../types';
import { ORIGIN_CARDS } from '../../data/cards/origin-cards';

// ---------------------------------------------------------------------------
// Onboarding State
// ---------------------------------------------------------------------------

/**
 * State machine for the 8-card origin sequence.
 */
export interface OnboardingState {
  /** Current card index (0-7). */
  cardIndex: number;

  /** Meters that have been revealed to the player so far. */
  metersRevealed: MeterName[];

  /** Tabs that have been unlocked so far. */
  tabsRevealed: string[];

  /** Whether the player's defining trait has been revealed. */
  traitRevealed: boolean;

  /** Whether the origin sequence is complete. */
  complete: boolean;
}

// ---------------------------------------------------------------------------
// Progressive Disclosure Maps
// ---------------------------------------------------------------------------

/**
 * Maps card index to which meters are newly revealed at that step.
 * Meters are cumulative — each step adds to previous reveals.
 *
 * - Card 0-1: No meters (player learns the swipe mechanic)
 * - Card 2: authority (first meter reveal)
 * - Card 3: populace, treasury
 * - Card 4: military, stability (all 5 now visible)
 * - Cards 5-7: No new meters
 */
const METER_REVEALS: Record<number, MeterName[]> = {
  2: ['authority'],
  3: ['populace', 'treasury'],
  4: ['military', 'stability'],
};

/**
 * Maps card index to which tabs are newly revealed at that step.
 *
 * - Card 7: court tab (NPC system unlocked after alliance card)
 * - Card 8 (completion): map tab (territory system unlocked)
 */
const TAB_REVEALS: Record<number, string[]> = {
  7: ['court'],
  8: ['map'],
};

/** Card index at which the player's defining trait is revealed. */
const TRAIT_REVEAL_INDEX = 6;

/** Total number of origin cards. */
const ORIGIN_LENGTH = 8;

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Get the origin card at a specific index.
 *
 * @param index - Card index (0-7).
 * @returns The origin Card, or null if index is out of bounds.
 */
export function getOriginCard(index: number): Card | null {
  if (index < 0 || index >= ORIGIN_CARDS.length) return null;
  return ORIGIN_CARDS[index] ?? null;
}

/**
 * Advance the onboarding state machine by one card.
 *
 * Returns a new OnboardingState with:
 * - cardIndex incremented
 * - Any newly revealed meters added
 * - Any newly unlocked tabs added
 * - Trait revealed flag updated
 * - Complete flag set when all 8 cards are done
 *
 * If already complete, returns state unchanged.
 *
 * @param state - Current onboarding state.
 * @returns New onboarding state after advancing one card.
 */
export function advanceOnboarding(state: OnboardingState): OnboardingState {
  if (state.complete) return state;

  const nextIndex = state.cardIndex + 1;
  const isComplete = nextIndex >= ORIGIN_LENGTH;

  // Gather newly revealed meters for the NEXT card index
  const newMeters = METER_REVEALS[nextIndex] ?? [];
  const metersRevealed = [...state.metersRevealed, ...newMeters];

  // Gather newly revealed tabs
  // Tab reveals happen at the completed card index + 1 to simulate
  // "after completing card N, tab unlocks"
  const newTabs = TAB_REVEALS[nextIndex] ?? [];
  // On completion (index 8), also unlock the map tab
  const completionTabs = isComplete ? (TAB_REVEALS[ORIGIN_LENGTH] ?? []) : [];
  const tabsRevealed = [...state.tabsRevealed, ...newTabs, ...completionTabs];

  // Trait is revealed when reaching card 6 (0-indexed)
  const traitRevealed = state.traitRevealed || nextIndex >= TRAIT_REVEAL_INDEX;

  return {
    cardIndex: nextIndex,
    metersRevealed,
    tabsRevealed,
    traitRevealed,
    complete: isComplete,
  };
}

/**
 * Get the cumulative list of meters that should be revealed
 * at a given card index.
 *
 * @param cardIndex - Current card index (0-7).
 * @returns Array of MeterName that should be visible.
 */
export function getRevealedMeters(cardIndex: number): MeterName[] {
  const revealed: MeterName[] = [];

  for (let i = 0; i <= cardIndex; i++) {
    const meters = METER_REVEALS[i];
    if (meters) {
      revealed.push(...meters);
    }
  }

  return revealed;
}

/**
 * Get the cumulative list of tabs that should be unlocked
 * at a given card index.
 *
 * @param cardIndex - Current card index (0-7+).
 * @returns Array of tab names that should be visible.
 */
export function getRevealedTabs(cardIndex: number): string[] {
  const revealed: string[] = [];

  for (let i = 0; i <= cardIndex; i++) {
    const tabs = TAB_REVEALS[i];
    if (tabs) {
      revealed.push(...tabs);
    }
  }

  return revealed;
}

/**
 * Create the initial onboarding state for a new game.
 *
 * @returns A fresh OnboardingState at card 0 with nothing revealed.
 */
export function createInitialOnboardingState(): OnboardingState {
  return {
    cardIndex: 0,
    metersRevealed: [],
    tabsRevealed: [],
    traitRevealed: false,
    complete: false,
  };
}

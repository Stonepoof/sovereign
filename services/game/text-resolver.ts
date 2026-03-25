/**
 * Sovereign — Text Resolver
 *
 * Resolves TextFunction types against game state. Handles both static strings
 * and dynamic functions that produce text based on the current TextContext.
 *
 * All functions are pure — no side effects, no mutations.
 *
 * @see SOV_PRD_07_NARRATIVE_ENGINE — text resolver specification
 */

import type {
  TextFunction,
  TextContext,
  Card,
  CardOption,
} from '../../types';

// ---------------------------------------------------------------------------
// Resolved Card (all text fields collapsed to plain strings)
// ---------------------------------------------------------------------------

export interface ResolvedCard {
  id: string;
  agency: Card['agency'];
  title: string;
  portrait: string;
  art?: string;
  npc?: string;
  text: string;
  narration?: string;
  left?: ResolvedOption;
  right?: ResolvedOption;
  up?: ResolvedOption;
  down?: ResolvedOption;
}

export interface ResolvedOption {
  direction: CardOption['direction'];
  label: string;
  sub: string;
  narr?: string;
  successNarr?: string;
  failNarr?: string;
}

// ---------------------------------------------------------------------------
// Core Resolver
// ---------------------------------------------------------------------------

/**
 * Resolve a TextFunction to a plain string.
 *
 * - If `text` is a string, returns it as-is.
 * - If `text` is a function, calls it with `ctx` and returns the result.
 * - If `text` is null/undefined, returns an empty string.
 */
export function resolveText(text: TextFunction | undefined | null, ctx: TextContext): string {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'function') {
    try {
      return text(ctx);
    } catch {
      // Graceful degradation — return empty string on resolver error
      return '';
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Option Resolver
// ---------------------------------------------------------------------------

function resolveOption(option: CardOption | undefined, ctx: TextContext): ResolvedOption | undefined {
  if (!option) return undefined;

  return {
    direction: option.direction,
    label: resolveText(option.label, ctx),
    sub: resolveText(option.sub, ctx),
    narr: option.narr ? resolveText(option.narr, ctx) : undefined,
    successNarr: option.successNarr ? resolveText(option.successNarr, ctx) : undefined,
    failNarr: option.failNarr ? resolveText(option.failNarr, ctx) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Card Resolver
// ---------------------------------------------------------------------------

/**
 * Resolve all TextFunction fields on a card to plain strings.
 * Returns a new ResolvedCard — the original card is not mutated.
 */
export function resolveCard(card: Card, ctx: TextContext): ResolvedCard {
  return {
    id: card.id,
    agency: card.agency,
    title: resolveText(card.title, ctx),
    portrait: card.portrait,
    art: card.art,
    npc: card.npc,
    text: resolveText(card.text, ctx),
    narration: card.narration ? resolveText(card.narration, ctx) : undefined,
    left: resolveOption(card.left, ctx),
    right: resolveOption(card.right, ctx),
    up: resolveOption(card.up, ctx),
    down: resolveOption(card.down, ctx),
  };
}

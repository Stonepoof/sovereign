// ─── Text Resolver ────────────────────────────────────────────────────────
// Resolves TextFunction values (string or context-dependent function) into
// plain strings. Used by card rendering and narrative display.

import { TextFunction, TextContext, Card, CardOption } from '../../types';

/** Resolve a TextFunction to a plain string */
export function resolveText(text: TextFunction, ctx: TextContext): string {
  if (typeof text === 'function') {
    return text(ctx);
  }
  return text;
}

/** Resolve all text fields in a card for display */
export function resolveCard(
  card: Card,
  ctx: TextContext,
): { title: string; text: string; options: { direction: string; label: string }[] } {
  return {
    title: resolveText(card.title, ctx),
    text: resolveText(card.text, ctx),
    options: card.options.map((opt) => ({
      direction: opt.direction,
      label: resolveText(opt.label, ctx),
    })),
  };
}

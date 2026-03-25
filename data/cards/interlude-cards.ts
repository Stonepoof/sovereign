/**
 * Sovereign — Interlude Cards
 *
 * Dramatic irony cards. No choices. Auto-advance based on text length.
 * Show the player information their character does not have.
 * Injected by the card selector every 8th card when conditions are met.
 *
 * @see SOV_PRD_07_NARRATIVE_ENGINE section 6 — interludes, dramatic irony
 */

import type { Card } from '../../types';

// ---------------------------------------------------------------------------
// Interlude Cards
// ---------------------------------------------------------------------------

export const INTERLUDE_CARDS: Card[] = [
  {
    id: 'int_kira',
    agency: 'interlude',
    title: "A Meeting You Don't See",
    portrait: '⚔️',
    text:
      'Midnight. A room you have never entered, deep in the military quarter. ' +
      'General Kira sits across from three officers. Maps spread on the table. ' +
      'Red circles mark the capital. "Not yet," she says. "But soon." ' +
      'You will not learn of this meeting. Not yet.',
    condition: (ctx) =>
      ctx.npcs.some((n) => n.name === 'General Kira' && n.loy < 45),
    setFlags: ['witnessed_kira'],
    once: true,
  },

  {
    id: 'int_elara',
    agency: 'interlude',
    title: "What Elara Won't Tell You",
    portrait: '🧙',
    text:
      'Elara sits alone in her chamber. A letter in her hand, the seal already broken. ' +
      'Your predecessor\'s handwriting. "If you are reading this, I am dead. ' +
      'Find someone worthy. Guide them. And whatever you do — ' +
      'do not tell them about the fires." She folds the letter carefully. ' +
      'Her hands do not shake. They should.',
    condition: (ctx) =>
      ctx.npcs.some((n) => n.name === 'Advisor Elara'),
    setFlags: ['witnessed_elara'],
    once: true,
  },

  {
    id: 'int_aldric_letter',
    agency: 'interlude',
    title: "Aldric's Correspondence",
    portrait: '🏛️',
    text:
      'In a private study hung with family crests, Lord Aldric writes by candlelight. ' +
      'The letter is addressed to a name you would recognize — a foreign dignitary ' +
      'with interests in your kingdom\'s mining rights. "The new Sovereign is ' +
      'manageable," he writes. "Proceed with the arrangement." ' +
      'The candle flickers. The wax seals. You are none the wiser.',
    condition: (ctx) =>
      ctx.memory.flags.has('raised_taxes') && !ctx.memory.flags.has('resolved_scandal'),
    setFlags: ['witnessed_aldric_plot'],
    once: true,
  },

  {
    id: 'int_slums_gathering',
    agency: 'interlude',
    title: 'The Underground',
    portrait: '🏚️',
    text:
      'Beneath the Slums, in a cellar lit by stolen lanterns, fifty people gather. ' +
      'They are not drunk. They are not angry. They are organized. A woman reads from ' +
      'a pamphlet: "When the crown fails the people, the people become the crown." ' +
      'Heads nod in the flickering light. Names are written. Weapons are counted.',
    condition: (ctx) =>
      ctx.meters.populace < 35 && ctx.week > 15,
    once: true,
  },

  {
    id: 'int_spy_double',
    agency: 'interlude',
    title: 'The Other Side',
    portrait: '🕵️',
    text:
      'The Spymaster meets a hooded figure in the rain. Coins change hands — in the ' +
      'wrong direction. The Spymaster is paying, not receiving. "The Sovereign suspects ' +
      'nothing," the hooded figure says. The Spymaster smiles. ' +
      '"The Sovereign suspects everything. That is why this works."',
    condition: (ctx) =>
      ctx.memory.flags.has('investigating_openly') ||
      ctx.memory.flags.has('investigating_secretly'),
    setFlags: ['witnessed_spy_double'],
    once: true,
  },
];

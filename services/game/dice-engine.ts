// ─── Dice Engine ──────────────────────────────────────────────────────────
// Dice rolling with modifier support and success threshold calculation.
// Uses DiceResult type from types/game.ts.

import { DiceResult } from '../../types';

/** Roll a single die (1-20 by default) */
export function rollDie(sides: number = 20): number {
  return Math.floor(Math.random() * sides) + 1;
}

/** Success threshold: ceil(max * 0.5). For d20, threshold = 10 */
export function successThreshold(max: number = 20): number {
  return Math.ceil(max * 0.5);
}

export interface DiceModifier {
  source: string;    // e.g. 'trait:cunning', 'npc:spymaster', 'meter:authority'
  value: number;     // +1, -1, etc.
}

/** Roll with modifiers applied. Returns full DiceResult. */
export function rollWithModifiers(
  target: number,
  modifiers: DiceModifier[] = [],
  sides: number = 20,
): DiceResult {
  const raw = rollDie(sides);
  const totalMod = modifiers.reduce((sum, m) => sum + m.value, 0);
  const effective = raw + totalMod;

  return {
    value: raw,
    roll: raw,
    target,
    success: effective >= target,
    criticalSuccess: raw === sides,
    criticalFailure: raw === 1,
    modifier: totalMod,
  };
}

/** Roll multiple dice and return the best result (advantage) */
export function rollAdvantage(
  target: number,
  count: number = 2,
  modifiers: DiceModifier[] = [],
): DiceResult {
  let best: DiceResult | null = null;
  for (let i = 0; i < count; i++) {
    const result = rollWithModifiers(target, modifiers);
    if (!best || (result.roll ?? 0) > (best.roll ?? 0)) {
      best = result;
    }
  }
  return best!;
}

/** Roll multiple dice and return the worst result (disadvantage) */
export function rollDisadvantage(
  target: number,
  count: number = 2,
  modifiers: DiceModifier[] = [],
): DiceResult {
  let worst: DiceResult | null = null;
  for (let i = 0; i < count; i++) {
    const result = rollWithModifiers(target, modifiers);
    if (!worst || (result.roll ?? 0) < (worst.roll ?? 0)) {
      worst = result;
    }
  }
  return worst!;
}

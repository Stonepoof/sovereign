// ─── Sovereign Dice Engine ────────────────────────────────────────────────────
// Core dice rolling with Sovereign's threshold system.
// Success threshold: ceil(max * 0.5) — a simpler, unified approach.

// ─── Types ──────────────────────────────────────────────────────────────────

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export interface DiceModifier {
  source: string;
  value: number;
}

export interface DiceRoll {
  dieType: DiceType;
  rawRoll: number;
  modifiers: DiceModifier[];
  total: number;
  threshold: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  isSuccess: boolean;
}

// ─── Die Sides Lookup ───────────────────────────────────────────────────────

const DIE_SIDES: Record<DiceType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

export function getDieSides(type: DiceType): number {
  return DIE_SIDES[type];
}

// ─── Sovereign Success Threshold ────────────────────────────────────────────
// ceil(max * 0.5) — e.g., d6 needs 3+, d20 needs 10+

export function successThreshold(dieMax: number, modifier: number = 0): number {
  return Math.ceil(dieMax * 0.5) - modifier;
}

// ─── Critical Detection ─────────────────────────────────────────────────────

export function isCriticalSuccess(roll: number, dieType: DiceType): boolean {
  return roll === getDieSides(dieType);
}

export function isCriticalFailure(roll: number): boolean {
  return roll === 1;
}

// ─── Core Roll Functions ────────────────────────────────────────────────────

export function rollDie(type: DiceType): number {
  const sides = getDieSides(type);
  return Math.floor(Math.random() * sides) + 1;
}

export function rollWithModifiers(
  dieType: DiceType,
  modifiers: DiceModifier[],
): DiceRoll {
  const sides = getDieSides(dieType);
  const rawRoll = rollDie(dieType);
  const totalMod = modifiers.reduce((sum, m) => sum + m.value, 0);
  const total = rawRoll + totalMod;
  const threshold = successThreshold(sides, totalMod);
  const critSuccess = isCriticalSuccess(rawRoll, dieType);
  const critFail = isCriticalFailure(rawRoll);

  return {
    dieType,
    rawRoll,
    modifiers,
    total,
    threshold,
    isCriticalSuccess: critSuccess,
    isCriticalFailure: critFail,
    isSuccess: critSuccess || (!critFail && total >= threshold),
  };
}

// ─── Advantage / Disadvantage ───────────────────────────────────────────────

export function rollWithAdvantage(
  dieType: DiceType,
  modifiers: DiceModifier[],
): DiceRoll {
  const roll1 = rollDie(dieType);
  const roll2 = rollDie(dieType);
  const rawRoll = Math.max(roll1, roll2);
  const sides = getDieSides(dieType);
  const totalMod = modifiers.reduce((sum, m) => sum + m.value, 0);
  const total = rawRoll + totalMod;
  const threshold = successThreshold(sides, totalMod);
  const critSuccess = isCriticalSuccess(rawRoll, dieType);
  const critFail = isCriticalFailure(rawRoll);

  return {
    dieType,
    rawRoll,
    modifiers,
    total,
    threshold,
    isCriticalSuccess: critSuccess,
    isCriticalFailure: critFail,
    isSuccess: critSuccess || (!critFail && total >= threshold),
  };
}

export function rollWithDisadvantage(
  dieType: DiceType,
  modifiers: DiceModifier[],
): DiceRoll {
  const roll1 = rollDie(dieType);
  const roll2 = rollDie(dieType);
  const rawRoll = Math.min(roll1, roll2);
  const sides = getDieSides(dieType);
  const totalMod = modifiers.reduce((sum, m) => sum + m.value, 0);
  const total = rawRoll + totalMod;
  const threshold = successThreshold(sides, totalMod);
  const critSuccess = isCriticalSuccess(rawRoll, dieType);
  const critFail = isCriticalFailure(rawRoll);

  return {
    dieType,
    rawRoll,
    modifiers,
    total,
    threshold,
    isCriticalSuccess: critSuccess,
    isCriticalFailure: critFail,
    isSuccess: critSuccess || (!critFail && total >= threshold),
  };
}

// ─── Contested Roll ─────────────────────────────────────────────────────────

export function contestedRoll(
  attackerDie: DiceType,
  attackerMods: DiceModifier[],
  defenderDie: DiceType,
  defenderMods: DiceModifier[],
): { attacker: DiceRoll; defender: DiceRoll; attackerWins: boolean } {
  const attackerRoll = rollWithModifiers(attackerDie, attackerMods);
  const defenderRoll = rollWithModifiers(defenderDie, defenderMods);

  return {
    attacker: attackerRoll,
    defender: defenderRoll,
    attackerWins: attackerRoll.total > defenderRoll.total, // ties go to defender
  };
}

// ─── Success Chance Calculator ──────────────────────────────────────────────

export function calculateSuccessChance(dieType: DiceType, totalModifier: number): number {
  const sides = getDieSides(dieType);
  const threshold = successThreshold(sides, totalModifier);
  const neededRoll = threshold;
  if (neededRoll <= 1) return 1;
  if (neededRoll > sides) return 0;
  return (sides - neededRoll + 1) / sides;
}

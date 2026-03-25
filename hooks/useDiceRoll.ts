/**
 * Sovereign — Dice Roll Hook
 *
 * State machine for the dice roll overlay animation.
 * WAITING -> ROLLING (20 random numbers at 45ms) -> RESULT (auto-advance 1.8s)
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY — dice check resolution
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { DieType, DiceResult } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of random values shown during the rolling animation. */
const ROLL_TICK_COUNT = 20;

/** Interval between each random value display in ms. */
const ROLL_TICK_INTERVAL = 45;

/** Time the result is displayed before auto-advance in ms. */
const RESULT_DISPLAY_DURATION = 1800;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DicePhase = 'waiting' | 'rolling' | 'result';

export interface DiceRollReturn {
  /** Current phase of the dice roll animation. */
  phase: DicePhase;
  /** The number currently displayed (random during rolling, final during result). */
  displayValue: number;
  /** The resolved dice result, available once phase is 'result'. */
  result: DiceResult | null;
  /** Start a roll with the given die type and modifier. */
  startRoll: (die: DieType, modifier: number) => void;
  /** Reset back to waiting state. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maximum value for each die type. */
const DIE_MAX: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

/**
 * Roll a random integer between 1 and max (inclusive).
 */
function rollDie(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

/**
 * Resolve a dice check into a DiceResult.
 * Success threshold = ceil(die_max * 0.5).
 * Natural max = critical success. Natural 1 = critical fail.
 */
function resolveDice(die: DieType, modifier: number): DiceResult {
  const max = DIE_MAX[die];
  const natural = rollDie(max);
  const total = natural + modifier;
  const threshold = Math.ceil(max * 0.5);
  const isCriticalMax = natural === max;
  const isCriticalMin = natural === 1;

  return {
    die,
    natural,
    modifier,
    total,
    threshold,
    success: isCriticalMax || (!isCriticalMin && total >= threshold),
    critical: isCriticalMax || isCriticalMin,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDiceRoll(): DiceRollReturn {
  const [phase, setPhase] = useState<DicePhase>('waiting');
  const [displayValue, setDisplayValue] = useState(1);
  const [result, setResult] = useState<DiceResult | null>(null);

  const tickCountRef = useRef(0);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDieRef = useRef<DieType>('d6');
  const pendingModRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  const startRoll = useCallback((die: DieType, modifier: number) => {
    // Store parameters for resolution after animation
    pendingDieRef.current = die;
    pendingModRef.current = modifier;
    tickCountRef.current = 0;

    const max = DIE_MAX[die];

    setPhase('rolling');
    setResult(null);

    // Clear any existing timers
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);

    // Animate random numbers
    rollIntervalRef.current = setInterval(() => {
      tickCountRef.current += 1;

      if (tickCountRef.current >= ROLL_TICK_COUNT) {
        // Animation complete — resolve the roll
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;

        const resolved = resolveDice(pendingDieRef.current, pendingModRef.current);
        setDisplayValue(resolved.total);
        setResult(resolved);
        setPhase('result');

        // Auto-advance timer (caller can also tap to skip via reset)
        resultTimerRef.current = setTimeout(() => {
          resultTimerRef.current = null;
        }, RESULT_DISPLAY_DURATION);
      } else {
        // Show random value during animation
        setDisplayValue(rollDie(max));
      }
    }, ROLL_TICK_INTERVAL);
  }, []);

  const reset = useCallback(() => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }

    tickCountRef.current = 0;
    setPhase('waiting');
    setDisplayValue(1);
    setResult(null);
  }, []);

  return { phase, displayValue, result, startRoll, reset };
}

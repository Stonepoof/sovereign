// ─── useDiceRoll ─────────────────────────────────────────────────────────────
// 3-phase dice roll: waiting → rolling → result
// Rolling phase: 20 random values at 45ms intervals
// Result phase: 1.8s auto-advance

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DicePhase, DiceResult } from '../types';

interface UseDiceRollOptions {
  threshold?: number;
  onResult: (result: DiceResult) => void;
}

interface UseDiceRollReturn {
  phase: DicePhase;
  displayValue: number;
  result: DiceResult | null;
  roll: () => void;
}

const ROLL_COUNT = 20;
const ROLL_INTERVAL = 45;
const RESULT_DISPLAY_MS = 1800;

export function useDiceRoll({
  threshold = 4,
  onResult,
}: UseDiceRollOptions): UseDiceRollReturn {
  const [phase, setPhase] = useState<DicePhase>('waiting');
  const [displayValue, setDisplayValue] = useState(1);
  const [result, setResult] = useState<DiceResult | null>(null);
  const rollCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  const roll = useCallback(() => {
    if (phase !== 'waiting') return;
    cleanup();
    setPhase('rolling');
    rollCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      rollCountRef.current += 1;
      const randomVal = Math.floor(Math.random() * 6) + 1;
      setDisplayValue(randomVal);

      if (rollCountRef.current >= ROLL_COUNT) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;

        // Final value
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDisplayValue(finalVal);

        const diceResult: DiceResult = {
          value: finalVal,
          success: finalVal >= threshold,
          threshold,
        };
        setResult(diceResult);
        setPhase('result');

        // Auto-advance after display time
        timeoutRef.current = setTimeout(() => {
          onResult(diceResult);
        }, RESULT_DISPLAY_MS);
      }
    }, ROLL_INTERVAL);
  }, [phase, threshold, onResult, cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { phase, displayValue, result, roll };
}

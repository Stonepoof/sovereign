/**
 * Sovereign — Auto-Advance Timer Hook
 *
 * Timer hook for auto-advancing ImpactSummary and Interlude cards.
 * Duration scales with text length so longer content gets more reading time.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY — impact summary timing
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AutoAdvanceOptions {
  /** The text content being displayed (used to calculate word count). */
  text: string;
  /** Base duration in milliseconds. */
  baseMs: number;
  /** Additional milliseconds per word. */
  perWordMs: number;
  /** Callback fired when the timer completes or skip is called. */
  onAdvance: () => void;
  /** Whether the timer is active. Set false to pause/disable. */
  enabled: boolean;
}

export interface AutoAdvanceReturn {
  /** Milliseconds remaining before auto-advance fires. */
  timeRemaining: number;
  /** Immediately fires onAdvance and clears the timer. */
  skip: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Count words in a string (split on whitespace, filter empty tokens).
 */
function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate display duration from text length.
 * Formula: max(baseMs, baseMs - 1000 + words * perWordMs)
 */
function calculateDuration(text: string, baseMs: number, perWordMs: number): number {
  const words = countWords(text);
  return Math.max(baseMs, baseMs - 1000 + words * perWordMs);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAutoAdvance(options: AutoAdvanceOptions): AutoAdvanceReturn {
  const { text, baseMs, perWordMs, onAdvance, enabled } = options;

  const duration = calculateDuration(text, baseMs, perWordMs);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAdvancedRef = useRef(false);
  const onAdvanceRef = useRef(onAdvance);

  // Keep callback ref fresh without retriggering effects
  onAdvanceRef.current = onAdvance;

  // Reset when text or enabled changes
  useEffect(() => {
    const newDuration = calculateDuration(text, baseMs, perWordMs);
    setTimeRemaining(newDuration);
    hasAdvancedRef.current = false;
  }, [text, baseMs, perWordMs]);

  // Run the countdown
  useEffect(() => {
    if (!enabled || hasAdvancedRef.current) return;

    const tickMs = 100;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - tickMs;
        if (next <= 0) {
          if (!hasAdvancedRef.current) {
            hasAdvancedRef.current = true;
            // Fire on next tick to avoid state update during render
            setTimeout(() => onAdvanceRef.current(), 0);
          }
          return 0;
        }
        return next;
      });
    }, tickMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, text, baseMs, perWordMs]);

  const skip = useCallback(() => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeRemaining(0);
    onAdvanceRef.current();
  }, []);

  return { timeRemaining, skip };
}

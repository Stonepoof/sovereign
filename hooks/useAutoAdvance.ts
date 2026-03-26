// ─── useAutoAdvance ──────────────────────────────────────────────────────────
// Auto-advance timer for narration cards.
// Duration: max(baseMs, baseMs - 1000 + words * perWordMs)
// Provides skip() to manually advance.

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoAdvanceOptions {
  text: string;
  baseMs?: number;
  perWordMs?: number;
  enabled?: boolean;
  onAdvance: () => void;
}

interface UseAutoAdvanceReturn {
  remainingMs: number;
  skip: () => void;
}

export function useAutoAdvance({
  text,
  baseMs = 3000,
  perWordMs = 200,
  enabled = true,
  onAdvance,
}: UseAutoAdvanceOptions): UseAutoAdvanceReturn {
  const [remainingMs, setRemainingMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAdvancedRef = useRef(false);

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const duration = Math.max(baseMs, baseMs - 1000 + wordCount * perWordMs);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
  }, []);

  const skip = useCallback(() => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    cleanup();
    setRemainingMs(0);
    onAdvance();
  }, [cleanup, onAdvance]);

  useEffect(() => {
    if (!enabled) return;
    hasAdvancedRef.current = false;
    setRemainingMs(duration);

    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setRemainingMs(Math.max(0, duration - elapsed));
    }, 100);

    timerRef.current = setTimeout(() => {
      if (!hasAdvancedRef.current) {
        hasAdvancedRef.current = true;
        cleanup();
        setRemainingMs(0);
        onAdvance();
      }
    }, duration);

    return cleanup;
  }, [text, duration, enabled, onAdvance, cleanup]);

  return { remainingMs, skip };
}

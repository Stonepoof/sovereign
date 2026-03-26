// ─── Meter Store ──────────────────────────────────────────────────────────
// 5 meters (authority, populace, treasury, military, stability) start at 50.
// Death occurs when any meter hits 0 or 100.

import { create } from 'zustand';
import { MeterName, MeterEffects } from '../types';

const METER_MIN = 0;
const METER_MAX = 100;
const METER_DEFAULT = 50;

function clamp(v: number): number {
  return Math.max(METER_MIN, Math.min(METER_MAX, v));
}

type MeterValues = Record<MeterName, number>;

interface MeterStoreState {
  meters: MeterValues;

  /** Apply partial meter effects with optional multiplier */
  applyMeters: (effects: MeterEffects, multiplier?: number) => void;
  setMeter: (key: MeterName, value: number) => void;
  /** Returns the first meter at 0 or 100 (priority order), or null if alive */
  checkDeath: () => { meter: MeterName; direction: 'low' | 'high' } | null;
  resetMeters: () => void;
}

const DEFAULT_METERS: MeterValues = {
  authority: METER_DEFAULT,
  populace: METER_DEFAULT,
  treasury: METER_DEFAULT,
  military: METER_DEFAULT,
  stability: METER_DEFAULT,
};

export const useMeterStore = create<MeterStoreState>((set, get) => ({
  meters: { ...DEFAULT_METERS },

  applyMeters: (effects, multiplier = 1) => {
    set((s) => {
      const next = { ...s.meters };
      for (const [key, delta] of Object.entries(effects)) {
        if (delta !== undefined) {
          const meter = key as MeterName;
          next[meter] = clamp(next[meter] + Math.round(delta * multiplier));
        }
      }
      return { meters: next };
    });
  },

  setMeter: (key, value) => {
    set((s) => ({
      meters: { ...s.meters, [key]: clamp(value) },
    }));
  },

  checkDeath: () => {
    const { meters } = get();
    // Priority order: stability > authority > populace > treasury > military
    const priority: MeterName[] = ['stability', 'authority', 'populace', 'treasury', 'military'];
    for (const key of priority) {
      if (meters[key] <= METER_MIN) return { meter: key, direction: 'low' as const };
      if (meters[key] >= METER_MAX) return { meter: key, direction: 'high' as const };
    }
    return null;
  },

  resetMeters: () => set({ meters: { ...DEFAULT_METERS } }),
}));

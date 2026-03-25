/**
 * Sovereign -- Meter Store
 *
 * Manages the 5 governance meters (authority, populace, treasury, military,
 * stability). Handles applying effects with optional success multipliers,
 * clamping values to 0-100, recording deltas, and checking death conditions.
 */

import { create } from 'zustand';
import type { MeterName, MeterEffects, MeterDelta, DeathCause } from '../types';
import { METER_NAMES } from '../types';
import { METERS, METER_STARTING_VALUE } from '../data';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface MeterStore {
  meters: Record<MeterName, number>;
  lastDelta: MeterDelta[];

  applyMeters: (effects: MeterEffects, successMultiplier?: number) => void;
  getMeter: (name: MeterName) => number;
  checkDeath: () => DeathCause | null;
  resetMeters: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createDefaultMeters(): Record<MeterName, number> {
  return {
    authority: METER_STARTING_VALUE,
    populace: METER_STARTING_VALUE,
    treasury: METER_STARTING_VALUE,
    military: METER_STARTING_VALUE,
    stability: METER_STARTING_VALUE,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useMeterStore = create<MeterStore>((set, get) => ({
  meters: createDefaultMeters(),
  lastDelta: [],

  applyMeters: (effects, successMultiplier = 1.0) =>
    set((state) => {
      const newMeters = { ...state.meters };
      const deltas: MeterDelta[] = [];

      for (const name of METER_NAMES) {
        const raw = effects[name];
        if (raw == null || raw === 0) continue;

        const scaled = Math.round(raw * successMultiplier);
        if (scaled === 0) continue;

        newMeters[name] = clamp(newMeters[name] + scaled, 0, 100);
        deltas.push({ meter: name, amount: scaled });
      }

      return { meters: newMeters, lastDelta: deltas };
    }),

  getMeter: (name) => get().meters[name],

  checkDeath: () => {
    const { meters } = get();

    for (const name of METER_NAMES) {
      const value = meters[name];
      if (value <= 0) {
        const def = METERS.find((m) => m.name === name);
        return {
          meter: name,
          direction: 'low' as const,
          narrative: def?.deathLow ?? `${name} collapsed.`,
        };
      }
      if (value >= 100) {
        const def = METERS.find((m) => m.name === name);
        return {
          meter: name,
          direction: 'high' as const,
          narrative: def?.deathHigh ?? `${name} overloaded.`,
        };
      }
    }

    return null;
  },

  resetMeters: () =>
    set({
      meters: createDefaultMeters(),
      lastDelta: [],
    }),
}));

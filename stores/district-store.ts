/**
 * Sovereign -- District Store
 *
 * Manages 5 district states (influence, unrest, prosperity) with weekly
 * tick logic: unrest contagion spreads to adjacent districts when above 30,
 * and all districts drift +2 unrest / -1 prosperity each tick.
 */

import { create } from 'zustand';
import type { DistrictId, DistrictState, DistrictFx } from '../types';
import { DISTRICT_IDS } from '../types';
import {
  DISTRICTS,
  ADJACENCY,
  CONTAGION_THRESHOLD,
  CONTAGION_RATE,
  DRIFT_UNREST,
  DRIFT_PROSPERITY,
} from '../data';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface DistrictStore {
  districts: Record<DistrictId, DistrictState>;

  applyDistrictFx: (fx: DistrictFx) => void;
  tickDistricts: () => void;
  getDistrict: (id: DistrictId) => DistrictState;
  resetDistricts: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createInitialDistricts(): Record<DistrictId, DistrictState> {
  const result = {} as Record<DistrictId, DistrictState>;
  for (const def of DISTRICTS) {
    result[def.id] = {
      id: def.id,
      influence: def.influence,
      unrest: def.unrest,
      prosperity: def.prosperity,
      assignedNpc: null,
    };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDistrictStore = create<DistrictStore>((set, get) => ({
  districts: createInitialDistricts(),

  applyDistrictFx: (fx) =>
    set((state) => {
      const district = state.districts[fx.id];
      if (!district) return state;

      const updated: DistrictState = {
        ...district,
        unrest: clamp(district.unrest + (fx.unrest ?? 0), 0, 100),
        prosperity: clamp(district.prosperity + (fx.prosperity ?? 0), 0, 100),
        influence: clamp(district.influence + (fx.influence ?? 0), 0, 100),
      };

      return {
        districts: { ...state.districts, [fx.id]: updated },
      };
    }),

  tickDistricts: () =>
    set((state) => {
      const next = {} as Record<DistrictId, DistrictState>;

      // Copy current state
      for (const id of DISTRICT_IDS) {
        next[id] = { ...state.districts[id] };
      }

      // Phase 1: Contagion -- districts with unrest > 30 have 15% chance
      // to spread +5 unrest to each adjacent district
      for (const id of DISTRICT_IDS) {
        if (state.districts[id].unrest > CONTAGION_THRESHOLD) {
          const adj = ADJACENCY[id] ?? [];
          for (const neighborId of adj) {
            if (Math.random() < CONTAGION_RATE) {
              next[neighborId].unrest = clamp(next[neighborId].unrest + 5, 0, 100);
            }
          }
        }
      }

      // Phase 2: Weekly drift -- all districts get +2 unrest, -1 prosperity
      for (const id of DISTRICT_IDS) {
        next[id].unrest = clamp(next[id].unrest + DRIFT_UNREST, 0, 100);
        next[id].prosperity = clamp(next[id].prosperity + DRIFT_PROSPERITY, 0, 100);
      }

      return { districts: next };
    }),

  getDistrict: (id) => get().districts[id],

  resetDistricts: () => set({ districts: createInitialDistricts() }),
}));

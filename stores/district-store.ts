// ─── District Store ───────────────────────────────────────────────────────
// 5 districts with unrest/prosperity/loyalty. Contagion + drift on tick.

import { create } from 'zustand';
import { DistrictId, DistrictState, MeterEffects } from '../types';

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

const DEFAULT_DISTRICTS: DistrictState[] = [
  { id: 'palace',   name: 'The Palace',   description: 'Seat of royal power',          unrest: 10, prosperity: 70, loyalty: 80, passiveEffects: { authority: 2 },                inCrisis: false, adjacent: ['market', 'temple'] },
  { id: 'market',   name: 'The Market',   description: 'Heart of commerce',             unrest: 25, prosperity: 60, loyalty: 50, passiveEffects: { treasury: 3 },                inCrisis: false, adjacent: ['palace', 'barracks', 'slums'] },
  { id: 'barracks', name: 'The Barracks', description: 'Military stronghold',            unrest: 15, prosperity: 40, loyalty: 65, passiveEffects: { military: 2 },                inCrisis: false, adjacent: ['market', 'temple', 'slums'] },
  { id: 'temple',   name: 'The Temple',   description: 'Center of faith and learning',   unrest:  5, prosperity: 50, loyalty: 70, passiveEffects: { stability: 2, populace: 1 }, inCrisis: false, adjacent: ['palace', 'barracks'] },
  { id: 'slums',    name: 'The Slums',    description: 'Where the forgotten dwell',      unrest: 40, prosperity: 20, loyalty: 30, passiveEffects: { populace: -1 },               inCrisis: false, adjacent: ['market', 'barracks'] },
];

interface DistrictStoreState {
  districts: DistrictState[];

  /** Weekly tick: contagion (unrest > 30 spreads 15% chance of +5 to adjacent) + drift (+2 unrest, -1 prosperity) */
  tickDistricts: () => void;

  /** Apply direct effects to a district */
  applyDistrictFx: (districtId: DistrictId, unrestDelta: number, prosperityDelta?: number) => void;

  getDistrict: (id: DistrictId) => DistrictState | undefined;
  resetDistricts: () => void;
}

export const useDistrictStore = create<DistrictStoreState>((set, get) => ({
  districts: DEFAULT_DISTRICTS.map((d) => ({ ...d })),

  tickDistricts: () => {
    set((s) => {
      const next = s.districts.map((d) => ({ ...d }));
      const lookup = new Map(next.map((d) => [d.id, d]));

      // Contagion: districts with unrest > 30 have 15% chance to add +5 to each adjacent
      for (const d of s.districts) {
        if (d.unrest > 30) {
          for (const adjId of d.adjacent) {
            if (Math.random() < 0.15) {
              const adj = lookup.get(adjId);
              if (adj) adj.unrest = clamp(adj.unrest + 5);
            }
          }
        }
      }

      // Drift + crisis check
      for (const d of next) {
        d.unrest = clamp(d.unrest + 2);
        d.prosperity = clamp(d.prosperity - 1);
        d.inCrisis = d.unrest > 70;
      }

      return { districts: next };
    });
  },

  applyDistrictFx: (districtId, unrestDelta, prosperityDelta = 0) => {
    set((s) => ({
      districts: s.districts.map((d) =>
        d.id === districtId
          ? {
              ...d,
              unrest: clamp(d.unrest + unrestDelta),
              prosperity: clamp(d.prosperity + prosperityDelta),
              inCrisis: clamp(d.unrest + unrestDelta) > 70,
            }
          : d,
      ),
    }));
  },

  getDistrict: (id) => get().districts.find((d) => d.id === id),

  resetDistricts: () =>
    set({ districts: DEFAULT_DISTRICTS.map((d) => ({ ...d })) }),
}));

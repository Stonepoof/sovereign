// ─── District Engine ──────────────────────────────────────────────────────
// Pure functions for district simulation.
// Contagion: unrest > 30 has 15% chance to spread +5 to adjacent districts.
// Drift: +2 unrest, -1 prosperity per tick.

import { DistrictState, DistrictId } from '../../types';

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/** Run one weekly tick on all districts. Returns a new array (immutable). */
export function tickDistricts(districts: DistrictState[]): DistrictState[] {
  const next = districts.map((d) => ({ ...d }));
  const lookup = new Map(next.map((d) => [d.id, d]));

  // Contagion pass: read from original, write to next
  for (const d of districts) {
    if (d.unrest > 30) {
      for (const adjId of d.adjacent) {
        if (Math.random() < 0.15) {
          const adj = lookup.get(adjId);
          if (adj) {
            adj.unrest = clamp(adj.unrest + 5);
          }
        }
      }
    }
  }

  // Drift + crisis pass
  for (const d of next) {
    d.unrest = clamp(d.unrest + 2);
    d.prosperity = clamp(d.prosperity - 1);
    d.inCrisis = d.unrest > 70;
  }

  return next;
}

/** Get the most unstable district */
export function getMostUnstable(districts: DistrictState[]): DistrictState | null {
  if (districts.length === 0) return null;
  return districts.reduce((worst, d) => (d.unrest > worst.unrest ? d : worst));
}

/** Get total prosperity across all districts */
export function getTotalProsperity(districts: DistrictState[]): number {
  return districts.reduce((sum, d) => sum + d.prosperity, 0);
}

/** Check if any district is in crisis (unrest > 70) */
export function getDistrictsInCrisis(districts: DistrictState[]): DistrictState[] {
  return districts.filter((d) => d.unrest > 70);
}

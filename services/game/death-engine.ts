/**
 * Sovereign — Death Engine
 *
 * Checks meters for lethal boundaries (0 or 100) and returns the appropriate
 * death narrative. Priority order: stability > authority > populace > treasury > military.
 *
 * All functions are pure — no side effects, no mutations.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY section 6 — death system
 */

import type { MeterName } from '../../types';
import { DEATHS, type DeathNarrative } from '../../data/deaths';

// ---------------------------------------------------------------------------
// Death Info (returned when a death condition is detected)
// ---------------------------------------------------------------------------

export interface DeathInfo {
  /** Which meter triggered the death. */
  meter: MeterName;
  /** Whether the meter hit the low (0) or high (100) boundary. */
  direction: 'low' | 'high';
  /** The full death narrative data. */
  narrative: DeathNarrative;
}

// ---------------------------------------------------------------------------
// Meter Check Priority
// ---------------------------------------------------------------------------

/**
 * Priority order for death checks. If multiple meters are at lethal levels
 * simultaneously, the first in this list wins.
 */
const DEATH_PRIORITY: MeterName[] = [
  'stability',
  'authority',
  'populace',
  'treasury',
  'military',
];

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Check all meters for death conditions.
 *
 * Returns the first DeathInfo found (by priority order), or null if all
 * meters are within safe bounds (1-99 inclusive).
 *
 * @param meters - Current meter values keyed by MeterName.
 * @returns DeathInfo if a meter is at 0 or 100, null otherwise.
 */
export function checkDeath(meters: Record<MeterName, number>): DeathInfo | null {
  for (const meter of DEATH_PRIORITY) {
    const value = meters[meter];

    // Skip if meter is not present (defensive)
    if (value == null) continue;

    if (value <= 0) {
      const narrative = getDeathNarrative(meter, 'low');
      if (narrative) {
        return { meter, direction: 'low', narrative };
      }
    }

    if (value >= 100) {
      const narrative = getDeathNarrative(meter, 'high');
      if (narrative) {
        return { meter, direction: 'high', narrative };
      }
    }
  }

  return null;
}

/**
 * Look up a specific death narrative by meter and direction.
 *
 * @param meter - The meter that hit a boundary.
 * @param direction - Whether it hit 'low' (0) or 'high' (100).
 * @returns The matching DeathNarrative, or null if not found.
 */
export function getDeathNarrative(
  meter: MeterName,
  direction: 'low' | 'high',
): DeathNarrative | null {
  return DEATHS.find((d) => d.meterName === meter && d.direction === direction) ?? null;
}

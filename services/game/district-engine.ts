/**
 * Sovereign — District Engine
 *
 * Weekly district tick with contagion spread and drift mechanics.
 * Districts form a parallel game layer that generates crisis cards
 * and applies pressure to the player's governance meters.
 *
 * All functions are pure — no side effects, no mutations.
 * Returns new objects; input state is never modified.
 *
 * @see SOV_PRD_04_TERRITORY — district tick rules, adjacency graph, crisis probability
 */

import type { DistrictId, DistrictState, Act } from '../../types';
import { ADJACENCY } from '../../data/districts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Unrest level above which contagion spreads to adjacent districts. */
const CONTAGION_THRESHOLD = 30;

/** Per-neighbor probability of contagion spread per tick. */
const CONTAGION_CHANCE = 0.15;

/** Amount of unrest spread to each affected neighbor. */
const CONTAGION_AMOUNT = 5;

/** Weekly unrest drift for all districts. */
const DRIFT_UNREST = 2;

/** Weekly prosperity drift for all districts. */
const DRIFT_PROSPERITY = -1;

/** District crisis check threshold: unrest must exceed this. */
const CRISIS_UNREST_THRESHOLD = 50;

/** Crisis probability by act for district crisis card injection. */
const CRISIS_PROBABILITY: Record<Act, number> = {
  1: 0.15,
  2: 0.30,
  3: 0.50,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a value between 0 and 100. */
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Deep clone a districts record. Each DistrictState is a plain object,
 * so a shallow copy per entry suffices.
 */
function cloneDistricts(
  districts: Record<DistrictId, DistrictState>,
): Record<DistrictId, DistrictState> {
  const result = {} as Record<DistrictId, DistrictState>;
  for (const [id, state] of Object.entries(districts)) {
    result[id as DistrictId] = { ...state };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Perform one weekly tick on all districts.
 *
 * Steps (in order):
 * 1. **Contagion**: For each district with unrest > 30, each adjacent district
 *    has a 15% chance to gain +5 unrest.
 * 2. **Drift**: All districts gain +2 unrest and lose -1 prosperity.
 * 3. **Clamp**: All values clamped to 0-100.
 *
 * @param districts - Current district states keyed by DistrictId.
 * @returns New district states with tick applied.
 */
export function tickDistricts(
  districts: Record<DistrictId, DistrictState>,
): Record<DistrictId, DistrictState> {
  const result = cloneDistricts(districts);

  // --- Phase 1: Contagion ---
  // We iterate over the ORIGINAL state for reads, write to result.
  // This prevents cascade within a single tick.
  for (const [id, state] of Object.entries(districts)) {
    if (state.unrest > CONTAGION_THRESHOLD) {
      const neighbors = ADJACENCY[id as DistrictId] ?? [];
      for (const neighborId of neighbors) {
        if (Math.random() < CONTAGION_CHANCE) {
          result[neighborId].unrest += CONTAGION_AMOUNT;
        }
      }
    }
  }

  // --- Phase 2: Drift ---
  for (const id of Object.keys(result) as DistrictId[]) {
    result[id].unrest += DRIFT_UNREST;
    result[id].prosperity += DRIFT_PROSPERITY;
  }

  // --- Phase 3: Clamp ---
  for (const id of Object.keys(result) as DistrictId[]) {
    result[id].unrest = clamp(result[id].unrest);
    result[id].prosperity = clamp(result[id].prosperity);
    result[id].influence = clamp(result[id].influence);
  }

  return result;
}

/**
 * Check whether a district should trigger a crisis card.
 *
 * A crisis triggers when:
 * 1. District unrest exceeds 50, AND
 * 2. A random roll passes the act-scaled probability check.
 *
 * @param district - The district state to check.
 * @param act - Current game act (1, 2, or 3).
 * @returns True if a crisis card should be injected for this district.
 */
export function checkDistrictCrisis(district: DistrictState, act: Act): boolean {
  if (district.unrest <= CRISIS_UNREST_THRESHOLD) return false;
  const probability = CRISIS_PROBABILITY[act] ?? 0.15;
  return Math.random() < probability;
}

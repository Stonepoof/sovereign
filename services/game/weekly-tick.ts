/**
 * Sovereign — Weekly Tick
 *
 * Orchestrates all per-week updates: district ticks, corruption growth,
 * and event logging. Called once per game week (each card = 1 week).
 *
 * All functions are pure — no side effects, no mutations.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY — weekly timeline, meter danger zones
 * @see SOV_PRD_04_TERRITORY — district tick rules
 */

import type { DistrictId, DistrictState, MeterName } from '../../types';
import { METER_DANGER_LOW, METER_DANGER_HIGH } from '../../types';
import { tickDistricts } from './district-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Input state for a weekly tick. */
export interface WeeklyTickInput {
  /** Current week number (1-48). */
  week: number;

  /** District states keyed by DistrictId. */
  districts: Record<DistrictId, DistrictState>;

  /** Current meter values keyed by MeterName. */
  meters: Record<MeterName, number>;

  /** Current corruption score (0-100). */
  corruption: number;
}

/** Output of a weekly tick — updated state plus event log. */
export interface WeeklyTickResult {
  /** Updated district states. */
  districts: Record<DistrictId, DistrictState>;

  /** Updated corruption score. */
  corruption: number;

  /** Log of events that occurred during this tick. */
  events: string[];
}

// ---------------------------------------------------------------------------
// Core Function
// ---------------------------------------------------------------------------

/**
 * Perform all weekly updates.
 *
 * Steps:
 * 1. Tick all districts (contagion + drift).
 * 2. Check if any meter is in the danger zone (<= 15 or >= 85).
 *    If so, add +1 corruption.
 * 3. Clamp corruption to 0-100.
 * 4. Return updated state and an event log.
 *
 * @param state - Current game state snapshot.
 * @returns Updated districts, corruption, and event log.
 */
export function weeklyTick(state: WeeklyTickInput): WeeklyTickResult {
  const events: string[] = [];

  // --- Step 1: District tick ---
  const updatedDistricts = tickDistricts(state.districts);

  // Log any district that changed significantly
  for (const [id, newState] of Object.entries(updatedDistricts)) {
    const oldState = state.districts[id as DistrictId];
    if (!oldState) continue;

    const unrestDelta = newState.unrest - oldState.unrest;
    if (unrestDelta >= 5) {
      events.push(`${id}: unrest surged by ${unrestDelta} (now ${newState.unrest})`);
    }

    if (newState.unrest >= 80 && oldState.unrest < 80) {
      events.push(`${id}: critical unrest level reached (${newState.unrest})`);
    }
  }

  // --- Step 2: Corruption from danger zone meters ---
  let corruption = state.corruption;
  const dangerMeters: string[] = [];

  for (const [meter, value] of Object.entries(state.meters)) {
    if (value <= METER_DANGER_LOW || value >= METER_DANGER_HIGH) {
      dangerMeters.push(meter);
    }
  }

  if (dangerMeters.length > 0) {
    corruption += 1;
    events.push(
      `Corruption +1 (danger zone: ${dangerMeters.join(', ')}). Now ${corruption}.`
    );
  }

  // --- Step 3: Clamp corruption ---
  corruption = Math.max(0, Math.min(100, corruption));

  // --- Week header ---
  events.unshift(`Week ${state.week} tick complete.`);

  return {
    districts: updatedDistricts,
    corruption,
    events,
  };
}

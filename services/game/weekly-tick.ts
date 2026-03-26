// ─── Weekly Tick ──────────────────────────────────────────────────────────
// Runs at the start of each new week: district tick + corruption check.

import { DistrictState } from '../../types';
import { tickDistricts } from './district-engine';

export interface WeeklyTickResult {
  districts: DistrictState[];
  corruptionDelta: number;
  events: string[];
}

/**
 * Run the weekly tick. Returns new district state, corruption change, and events.
 * @param districts Current district state
 * @param corruption Current corruption level (0-100)
 * @param week Current week number (1-48)
 */
export function weeklyTick(
  districts: DistrictState[],
  corruption: number,
  week: number,
): WeeklyTickResult {
  const events: string[] = [];

  // 1. Tick districts (contagion + drift)
  const newDistricts = tickDistricts(districts);

  // 2. Corruption check: corruption rises faster in later acts
  let corruptionDelta = 0;
  if (corruption > 0) {
    corruptionDelta = 1;
    if (corruption > 30) corruptionDelta += 1;
    if (corruption > 60) corruptionDelta += 1;
    if (week > 36) corruptionDelta += 1;

    events.push(`Corruption festers (+${corruptionDelta})`);
  }

  // 3. Check for district crises
  for (const d of newDistricts) {
    if (d.inCrisis) {
      events.push(`${d.name} is on the brink of revolt (unrest: ${d.unrest})`);
    }
  }

  // 4. Prosperity report
  const totalProsperity = newDistricts.reduce((sum, d) => sum + d.prosperity, 0);
  if (totalProsperity < 100) {
    events.push('The kingdom languishes in poverty');
  }

  return {
    districts: newDistricts,
    corruptionDelta,
    events,
  };
}

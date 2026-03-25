/**
 * Sovereign — Meter Definitions
 *
 * Five governance meters that drive the core tension. Any meter reaching
 * 0 or 100 triggers player death with a unique narrative.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY section 2 — meter table, zones, death triggers
 */

import type { MeterDef, MeterName, MeterZone } from '../types';

// ---------------------------------------------------------------------------
// Meter Definitions
// ---------------------------------------------------------------------------

export const METERS: MeterDef[] = [
  {
    name: 'authority',
    label: 'Authority',
    icon: '⚔️',
    color: '#dc3545',
    deathLow: 'Coalition overthrows you',
    deathHigh: 'Assassination (tyrant)',
  },
  {
    name: 'populace',
    label: 'Populace',
    icon: '👥',
    color: '#4a9eff',
    deathLow: "People's Revolt",
    deathHigh: 'Inner circle coup (cult of personality)',
  },
  {
    name: 'treasury',
    label: 'Treasury',
    icon: '💰',
    color: '#f0ad4e',
    deathLow: 'Bankruptcy',
    deathHigh: 'Corruption scandal',
  },
  {
    name: 'military',
    label: 'Military',
    icon: '🛡️',
    color: '#28a745',
    deathLow: 'Military coup',
    deathHigh: 'Civilian uprising against martial law',
  },
  {
    name: 'stability',
    label: 'Stability',
    icon: '⚖️',
    color: '#8b5cf6',
    deathLow: 'State dissolution (anarchy)',
    deathHigh: 'Parliament no-confidence vote',
  },
];

/** Starting value for all meters. */
export const METER_STARTING_VALUE = 50;

/** Meter range. */
export const METER_MIN = 0;
export const METER_MAX = 100;

// ---------------------------------------------------------------------------
// Threshold Constants
// ---------------------------------------------------------------------------

/** Danger zone: value <= 15 or >= 85. Bar turns red, pulses. */
export const DANGER_LOW = 15;
export const DANGER_HIGH = 85;

/** Warning zone: value 16-25 or 75-84. Bar turns amber. */
export const WARNING_LOW_MIN = 16;
export const WARNING_LOW_MAX = 25;
export const WARNING_HIGH_MIN = 75;
export const WARNING_HIGH_MAX = 84;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Determine the visual zone for a given meter value. */
export function getMeterZone(value: number): MeterZone {
  if (value <= DANGER_LOW || value >= DANGER_HIGH) return 'danger';
  if (value <= WARNING_LOW_MAX || value >= WARNING_HIGH_MIN) return 'warning';
  return 'safe';
}

/** Look up a meter definition by name. */
export function getMeterDef(name: MeterName): MeterDef | undefined {
  return METERS.find((m) => m.name === name);
}

/** Create initial meter values (all at 50). */
export function createInitialMeters(): Record<MeterName, number> {
  return {
    authority: METER_STARTING_VALUE,
    populace: METER_STARTING_VALUE,
    treasury: METER_STARTING_VALUE,
    military: METER_STARTING_VALUE,
    stability: METER_STARTING_VALUE,
  };
}

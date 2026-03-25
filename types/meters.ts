/**
 * Sovereign — Meter System Types
 *
 * Five meters drive the core tension: Authority, Populace, Treasury,
 * Military, Stability. Any meter reaching 0 or 100 kills the player.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY section 2 — meter definitions and rules
 */

// ---------------------------------------------------------------------------
// Meter Identifiers
// ---------------------------------------------------------------------------

/**
 * The five governance meters. Order matters for display.
 *
 * | Meter     | Icon | Color   | Death at 0               | Death at 100                |
 * |-----------|------|---------|--------------------------|------------------------------|
 * | authority | sword| #dc3545 | Coalition overthrows you | Assassination (tyrant)       |
 * | populace  | people| #4a9eff | People's Revolt         | Inner circle coup            |
 * | treasury  | gold | #f0ad4e | Bankruptcy               | Corruption scandal           |
 * | military  | shield| #28a745 | Military coup            | Civilian uprising            |
 * | stability | scales| #8b5cf6 | State dissolution        | Parliament no-confidence     |
 */
export type MeterName = 'authority' | 'populace' | 'treasury' | 'military' | 'stability';

/** Ordered list of all meter names for iteration. */
export const METER_NAMES: MeterName[] = [
  'authority',
  'populace',
  'treasury',
  'military',
  'stability',
];

// ---------------------------------------------------------------------------
// Meter Definition
// ---------------------------------------------------------------------------

/**
 * Static definition for a single meter including display info and thresholds.
 */
export interface MeterDef {
  /** Unique meter identifier. */
  name: MeterName;

  /** Emoji icon for prototype display. */
  icon: string;

  /** Human-readable label (e.g. "Authority"). */
  label: string;

  /** Theme color hex string. */
  color: string;

  /** Narrative text when this meter hits 0. */
  deathLow: string;

  /** Narrative text when this meter hits 100. */
  deathHigh: string;
}

// ---------------------------------------------------------------------------
// Meter Runtime State
// ---------------------------------------------------------------------------

/**
 * Runtime state for a single meter during gameplay.
 */
export interface Meter {
  /** Meter identifier. */
  name: MeterName;

  /** Current value (0-100, clamped). All meters initialize at 50. */
  value: number;

  /** Emoji icon. */
  icon: string;

  /** Display label. */
  label: string;

  /** Theme color. */
  color: string;

  /** Whether this meter has been revealed to the player (progressive disclosure). */
  revealed: boolean;
}

// ---------------------------------------------------------------------------
// Meter Zones
// ---------------------------------------------------------------------------

/**
 * Visual zone for a meter value. Determines bar color and animations.
 *
 * - `danger`  — value <= 15 or >= 85: bar turns red, pulses
 * - `warning` — value 16-25 or 75-84: bar turns amber
 * - `safe`    — value 26-74: normal display
 */
export type MeterZone = 'danger' | 'warning' | 'safe';

/** Danger threshold: at or below this value, meter is in danger zone. */
export const METER_DANGER_LOW = 15;

/** Danger threshold: at or above this value, meter is in danger zone. */
export const METER_DANGER_HIGH = 85;

/** Warning threshold: 16-25 is warning low. */
export const METER_WARNING_LOW = 25;

/** Warning threshold: 75-84 is warning high. */
export const METER_WARNING_HIGH = 75;

/** Starting value for all meters. */
export const METER_INITIAL_VALUE = 50;

// ---------------------------------------------------------------------------
// Meter Effects (deltas applied by cards)
// ---------------------------------------------------------------------------

/**
 * A partial map of meter deltas applied by a card option.
 * Positive values increase the meter; negative values decrease.
 * Only meters that change need to be specified.
 */
export interface MeterEffects {
  authority?: number;
  populace?: number;
  treasury?: number;
  military?: number;
  stability?: number;
}

/**
 * A single meter change with its name and signed amount.
 * Used for displaying delta animations.
 */
export interface MeterDelta {
  /** Which meter changed. */
  meter: MeterName;
  /** Signed delta amount (positive = increase, negative = decrease). */
  amount: number;
}

// ---------------------------------------------------------------------------
// Meter Application
// ---------------------------------------------------------------------------

/**
 * Parameters for applying meter effects after a card resolves.
 *
 * When a dice check fails, effects are multiplied by 0.3 (30% potency).
 * Critical success always applies full effect regardless.
 */
export interface MeterApplication {
  /** The meter effects to apply. */
  effects: MeterEffects;

  /** Whether the action succeeded (full effect) or failed (30% effect). */
  success: boolean;

  /** Whether this was a critical result (natural max or natural 1). */
  critical?: boolean;
}

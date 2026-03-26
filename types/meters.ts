// ─── Meter Types ──────────────────────────────────────────────────────────

/** The 5 core meters */
export type MeterName = 'authority' | 'populace' | 'treasury' | 'military' | 'stability';

/** Alias used by consumer components */
export type MeterKey = MeterName;

/** Effects on meters — partial record of meter name to numeric delta */
export type MeterEffects = Partial<Record<MeterName, number>>;

/** A single meter delta (meter + delta pair) */
export interface MeterDelta {
  meter: string;
  delta: number;
}

/** Current state of all meters — maps meter name to numeric value */
export type MeterState = Record<MeterName, number>;

/** Zone classification for meter values */
export type MeterZone = 'critical' | 'warning' | 'healthy' | 'excessive';

/** Meter definition (static config) */
export interface MeterDef {
  name: MeterName;
  label: string;
  icon: string;
  description: string;
  deathLow: string;
  deathHigh: string;
  startValue: number;
  min: number;
  max: number;
}

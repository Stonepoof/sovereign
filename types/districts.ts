// ─── District Types ───────────────────────────────────────────────────────

import { MeterEffects } from './meters';

/** The 5 districts of the capital */
export type DistrictId = 'palace' | 'market' | 'barracks' | 'temple' | 'slums';

/** Simplified district used by the game store and components */
export interface District {
  id: string;
  name: string;
  x: number;
  y: number;
  unrest: number;
  connectedTo: string[];
  population: number;
  income: number;
}

/** Current state of a district (detailed) */
export interface DistrictState {
  id: DistrictId;
  name: string;
  description: string;
  unrest: number;       // 0-100, higher = more unrest
  prosperity: number;   // 0-100, higher = more prosperous
  loyalty: number;      // 0-100, higher = more loyal
  /** Active effects this district applies each turn */
  passiveEffects: MeterEffects;
  /** Whether this district is in crisis */
  inCrisis: boolean;
  /** Adjacent districts (for contagion mechanics) */
  adjacent: DistrictId[];
}

/** District definition (static config) */
export interface DistrictDef {
  id: DistrictId;
  name: string;
  description: string;
  adjacent: DistrictId[];
  startUnrest: number;
  startProsperity: number;
  startLoyalty: number;
  /** Base passive effects when district is stable */
  baseEffects: MeterEffects;
  /** Effects when district is in crisis */
  crisisEffects: MeterEffects;
}

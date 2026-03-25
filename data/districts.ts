/**
 * Sovereign — District Definitions
 *
 * Five districts form a parallel game layer. Each has influence, unrest,
 * and prosperity stats. Unmanaged districts drift toward instability.
 * Unrest spreads via adjacency graph.
 *
 * @see SOV_PRD_04_TERRITORY — district table, adjacency graph, tick rules
 */

import type { DistrictDef, DistrictId } from '../types';

// ---------------------------------------------------------------------------
// District Definitions
// ---------------------------------------------------------------------------

export const DISTRICTS: DistrictDef[] = [
  {
    id: 'capital',
    name: 'Capital',
    icon: '👑',
    color: '#c9a55a',
    x: 50,
    y: 30,
    influence: 80,
    unrest: 10,
    prosperity: 70,
    adj: ['market', 'temple'],
    theme: 'Court intrigue, diplomatic incidents, coups',
  },
  {
    id: 'market',
    name: 'Market District',
    icon: '🏪',
    color: '#f0ad4e',
    x: 20,
    y: 25,
    influence: 60,
    unrest: 20,
    prosperity: 65,
    adj: ['capital', 'docks'],
    theme: 'Trade, merchants, economic crises',
  },
  {
    id: 'temple',
    name: 'Temple Quarter',
    icon: '⛪',
    color: '#8b5cf6',
    x: 80,
    y: 25,
    influence: 55,
    unrest: 15,
    prosperity: 50,
    adj: ['capital', 'slums'],
    theme: 'Faith, ideology, popular movements',
  },
  {
    id: 'docks',
    name: 'The Docks',
    icon: '⚓',
    color: '#4a9eff',
    x: 20,
    y: 75,
    influence: 35,
    unrest: 40,
    prosperity: 55,
    adj: ['market', 'slums'],
    theme: 'Smuggling, foreign agents, labor unrest',
  },
  {
    id: 'slums',
    name: 'The Slums',
    icon: '🏚️',
    color: '#dc3545',
    x: 80,
    y: 75,
    influence: 20,
    unrest: 60,
    prosperity: 20,
    adj: ['temple', 'docks'],
    theme: 'Crime, plague, rebellion seeds',
  },
];

// ---------------------------------------------------------------------------
// Adjacency Graph (for quick lookup)
// ---------------------------------------------------------------------------

/**
 * Adjacency map derived from DISTRICTS definitions.
 *
 *     Market ──── Capital ──── Temple
 *       │                        │
 *       │                        │
 *     Docks ──────────────── Slums
 */
export const ADJACENCY: Record<DistrictId, DistrictId[]> = {
  capital: ['market', 'temple'],
  market: ['capital', 'docks'],
  temple: ['capital', 'slums'],
  docks: ['market', 'slums'],
  slums: ['temple', 'docks'],
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Unrest above this threshold triggers contagion spread. */
export const CONTAGION_THRESHOLD = 30;

/** Fraction of unrest spread to adjacent districts per tick. */
export const CONTAGION_RATE = 0.15;

/** Weekly drift for unmanaged districts: +2 unrest, -1 prosperity. */
export const DRIFT_UNREST = 2;
export const DRIFT_PROSPERITY = -1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up a district definition by ID. */
export function getDistrictDef(id: DistrictId): DistrictDef | undefined {
  return DISTRICTS.find((d) => d.id === id);
}

/** Create initial district states from definitions. */
export function createInitialDistricts(): Record<DistrictId, { influence: number; unrest: number; prosperity: number }> {
  const result: any = {};
  for (const d of DISTRICTS) {
    result[d.id] = {
      influence: d.influence,
      unrest: d.unrest,
      prosperity: d.prosperity,
    };
  }
  return result;
}

// ─── District Definitions ─────────────────────────────────────────────────

import { DistrictDef, DistrictId, DistrictState } from '../types/districts';

/** Contagion constants — how unrest spreads between adjacent districts */
export const CONTAGION = {
  /** Unrest threshold that triggers spread */
  SPREAD_THRESHOLD: 70,
  /** How much unrest spreads per turn to adjacent districts */
  SPREAD_RATE: 5,
  /** Unrest level that triggers district crisis */
  CRISIS_THRESHOLD: 85,
  /** Natural unrest decay per turn when below threshold */
  NATURAL_DECAY: 2,
} as const;

export const DISTRICT_DEFS: Record<DistrictId, DistrictDef> = {
  palace: {
    id: 'palace',
    name: 'The Palace Quarter',
    description: 'Seat of royal power. Nobles and courtiers scheme in gilded halls.',
    adjacent: ['market', 'barracks'],
    startUnrest: 10,
    startProsperity: 80,
    startLoyalty: 70,
    baseEffects: { authority: 2 },
    crisisEffects: { authority: -5, stability: -3 },
  },
  market: {
    id: 'market',
    name: 'The Grand Market',
    description: 'Heart of commerce. Merchants hawk wares from across the known world.',
    adjacent: ['palace', 'slums', 'temple'],
    startUnrest: 20,
    startProsperity: 70,
    startLoyalty: 50,
    baseEffects: { treasury: 2 },
    crisisEffects: { treasury: -5, populace: -3 },
  },
  barracks: {
    id: 'barracks',
    name: 'The Barracks District',
    description: 'Where soldiers train and weapons are forged. Discipline is law here.',
    adjacent: ['palace', 'slums'],
    startUnrest: 15,
    startProsperity: 50,
    startLoyalty: 75,
    baseEffects: { military: 2 },
    crisisEffects: { military: -5, authority: -3 },
  },
  temple: {
    id: 'temple',
    name: 'The Temple District',
    description: 'Spires reach toward the heavens. The clergy wields influence over hearts and minds.',
    adjacent: ['market', 'slums'],
    startUnrest: 10,
    startProsperity: 60,
    startLoyalty: 80,
    baseEffects: { stability: 2 },
    crisisEffects: { stability: -5, populace: -3 },
  },
  slums: {
    id: 'slums',
    name: 'The Outer Slums',
    description: 'Where the forgotten dwell. Poverty breeds desperation and cunning.',
    adjacent: ['market', 'barracks', 'temple'],
    startUnrest: 40,
    startProsperity: 20,
    startLoyalty: 25,
    baseEffects: { populace: 1 },
    crisisEffects: { populace: -5, stability: -5 },
  },
};

/** All district IDs in display order */
export const DISTRICT_IDS: DistrictId[] = ['palace', 'market', 'barracks', 'temple', 'slums'];

/** Create initial district states for a new game */
export function createInitialDistricts(): Record<DistrictId, DistrictState> {
  const districts = {} as Record<DistrictId, DistrictState>;
  for (const def of Object.values(DISTRICT_DEFS)) {
    districts[def.id] = {
      id: def.id,
      name: def.name,
      description: def.description,
      unrest: def.startUnrest,
      prosperity: def.startProsperity,
      loyalty: def.startLoyalty,
      passiveEffects: { ...def.baseEffects },
      inCrisis: false,
      adjacent: def.adjacent,
    };
  }
  return districts;
}

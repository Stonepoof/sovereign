// ─── Data Barrel Export ───────────────────────────────────────────────────

// Meters
export { METER_DEFS, METER_NAMES, getMeterZone, createInitialMeters, clampMeter, checkDeathCondition } from './meters';

// Districts
export { DISTRICT_DEFS, DISTRICT_IDS, CONTAGION, createInitialDistricts } from './districts';

// NPCs
export { VOICE_PROFILES, RECRUITABLE_NPCS, NON_RECRUITABLE_NPCS, ALL_NPCS, createInitialNPCState, createAllNPCStates } from './npcs';

// Worlds
export { WORLDS, getWorld, getUnlockedWorlds } from './worlds';

// Deaths
export { DEATH_NARRATIVES, getDeathNarrative, getDeathForMeter } from './deaths';
export type { DeathNarrative } from './deaths';

// Cards
export {
  ORIGIN_CARDS,
  BASE_CARDS,
  CRISIS_CARDS,
  DISTRICT_CARDS,
  INTERLUDE_CARDS,
  CONVERSATION_CARDS,
  FOLLOWUP_CARDS,
} from './cards';

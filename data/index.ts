/**
 * Sovereign — Data Layer Index
 *
 * Re-exports all static game data for convenient imports.
 * Usage: import { METERS, DISTRICTS, NPCS, BASE_CARDS, ... } from './data';
 */

// Core definitions
export { METERS, METER_STARTING_VALUE, getMeterZone, getMeterDef, createInitialMeters } from './meters';
export { DISTRICTS, ADJACENCY, getDistrictDef, createInitialDistricts } from './districts';
export { NPCS, VOICE_PROFILES, LORD_ALDRIC, VILLAGE_ELDER, SPYMASTER, getNPCDef, getVoiceProfile } from './npcs';
export { WORLDS, DEFAULT_WORLD_ID, getWorldDef, getUnlockedWorlds } from './worlds';
export { DEATHS, getDeathNarrative } from './deaths';

// Card collections
export {
  ORIGIN_CARDS,
  BASE_CARDS,
  CRISIS_CARDS,
  DISTRICT_CARDS,
  INTERLUDE_CARDS,
  CONVERSATION_CARDS,
  FOLLOWUP_CARDS,
} from './cards';

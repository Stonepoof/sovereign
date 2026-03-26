// ─── Core Game Types ──────────────────────────────────────────────────────

/** Phases of the game lifecycle */
export type GamePhase =
  | 'title'        // Title screen
  | 'origin'       // Onboarding / character creation
  | 'playing'      // Main swipe-card gameplay
  | 'gameplay'     // Main swipe-card gameplay (alias)
  | 'interlude'    // Between-round narrative interludes
  | 'crisis'       // Crisis events requiring immediate response
  | 'conversation' // NPC conversation sequences
  | 'death'        // Game over screen
  | 'summary';     // End-of-run summary

/** Swipe directions */
export type Direction = 'left' | 'right' | 'up' | 'down';
/** Alias used by consumer components */
export type SwipeDirection = Direction;

/** Agency types — each card action maps to one */
export type AgencyType =
  | 'decree'
  | 'diplomacy'
  | 'commerce'
  | 'military'
  | 'espionage'
  | 'faith'
  | 'infrastructure'
  | 'culture'
  | 'justice';

/** Defining trait chosen during origin phase (object form) */
export interface Trait {
  id: string;
  name: string;
  description: string;
}

/** Defining trait identifiers (string union) */
export type DefiningTrait =
  | 'merciful'
  | 'ruthless'
  | 'scholarly'
  | 'charismatic'
  | 'paranoid'
  | 'pious'
  | 'cunning'
  | 'stoic';

/** Faction affiliations in the world */
export type FactionId =
  | 'crown'
  | 'merchant'
  | 'merchants'
  | 'military'
  | 'clergy'
  | 'faith'
  | 'underworld'
  | 'shadow'
  | 'commoners';

/** A single player choice recorded for history */
export interface Choice {
  cardId: string;
  direction: Direction;
  turn: number;
  timestamp: number;
  meterEffects: Record<string, number>;
}

/** Impact summary shown after a choice */
export interface ImpactSummary {
  title: string;
  description: string;
  meterChanges: Record<string, number>;
  agencyType: AgencyType;
}

/** Result of a dice roll */
export interface DiceResult {
  /** The value rolled */
  value: number;
  /** The roll value (alias) */
  roll?: number;
  /** Target/threshold to meet or exceed */
  target?: number;
  threshold?: number;
  /** Whether the roll succeeded */
  success: boolean;
  criticalSuccess?: boolean;
  criticalFailure?: boolean;
  modifier?: number;
}

/** Phase of a dice roll animation */
export type DicePhase = 'waiting' | 'rolling' | 'result';

/** Sub-phases during card gameplay */
export type CardSubPhase =
  | 'narration'
  | 'card'
  | 'dice'
  | 'impact'
  | 'conversation'
  | 'convo_result';

/** World definition used by WorldSelect */
export interface World {
  id: string;
  name: string;
  description: string;
  theme?: string;
  color?: string;
  unlocked?: boolean;
  difficulty?: 'normal' | 'hard' | 'nightmare';
  cardPool?: string[];
}

/** Alias for backward compatibility */
export type WorldDef = World;

/** Tab configuration for the tab bar */
export interface TabConfig {
  key: string;
  label: string;
  icon: string;
  unlockWeek: number;
}

/** Conversation response option */
export interface ConvoResponse {
  label: string;
  rapportDelta: number;
  loyaltyDelta: number;
}

/** A single beat in a conversation (simple form) */
export interface ConvoBeat {
  speaker: string;
  text: string;
}

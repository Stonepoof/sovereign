/**
 * Sovereign — Core Game Types
 *
 * Defines the fundamental game phases, acts, swipe directions,
 * agency types, and the top-level game state shape.
 *
 * @see SOV_PRD_01_OVERVIEW — elevator pitch, term structure, card distribution
 * @see SOV_PRD_03_CORE_GAMEPLAY — swipe mechanic, 48-week timeline, death system
 * @see SOV_PRD_08_ONBOARDING — origin card sequence, progressive disclosure
 */

// ---------------------------------------------------------------------------
// Game Phases
// ---------------------------------------------------------------------------

/**
 * Top-level phase of the game session.
 *
 * - `world_select` — player choosing which world/setting to play
 * - `origin`       — 8-card interleaved onboarding sequence
 * - `playing`      — main 48-week gameplay loop
 * - `death`        — a meter hit 0 or 100; death screen shown
 */
export type GamePhase = 'world_select' | 'origin' | 'playing' | 'death';

// ---------------------------------------------------------------------------
// Acts
// ---------------------------------------------------------------------------

/**
 * The 48-week term is divided into 3 acts of 16 weeks each.
 *
 * - Act 1 (weeks 1-16): Establishment  — 20% crisis density
 * - Act 2 (weeks 17-32): Escalation    — 40% crisis density
 * - Act 3 (weeks 33-48): Climax        — 60% crisis density
 */
export type Act = 1 | 2 | 3;

// ---------------------------------------------------------------------------
// Swipe Directions
// ---------------------------------------------------------------------------

/**
 * The four cardinal swipe directions. Each card can define up to 4 options
 * mapped to these directions. Direction is determined by comparing
 * abs(dx) vs abs(dy) at finger release.
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

// ---------------------------------------------------------------------------
// Swipe State Machine
// ---------------------------------------------------------------------------

/**
 * States for the release-based swipe mechanic.
 *
 * - `idle`          — waiting for touch
 * - `dragging`      — finger down, card following
 * - `committed`     — finger released past threshold or velocity override
 * - `exiting`       — card flying off-screen (250ms linear)
 * - `snapping_back` — card returning to center (300ms spring overshoot)
 */
export type SwipeState = 'idle' | 'dragging' | 'committed' | 'exiting' | 'snapping_back';

// ---------------------------------------------------------------------------
// World Event Phase (2-phase rendering)
// ---------------------------------------------------------------------------

/**
 * World and crisis cards use a 2-phase render model:
 *
 * 1. `narration` — WorldNarration component shows event text + auto-meters
 * 2. `reaction`  — SwipeCard appears for the player's response
 * 3. `null`      — standard single-phase card (no world event)
 */
export type WorldEventPhase = 'narration' | 'reaction' | null;

/** Shorthand alias used throughout the codebase. */
export type WEP = WorldEventPhase;

// ---------------------------------------------------------------------------
// Agency Types (9 card types)
// ---------------------------------------------------------------------------

/**
 * Each card carries an agency type that determines its render component,
 * badge color, tonal voice, and player interaction model.
 *
 * | Agency       | Badge     | Interaction                 |
 * |--------------|-----------|-----------------------------|
 * | world        | #dc3545   | 2-phase: narration then swipe |
 * | petition     | #4a9eff   | 4-dir swipe                |
 * | personal     | #8b5cf6   | 4-dir swipe                |
 * | action       | #28a745   | 4-dir swipe                |
 * | crisis       | #ff6b35   | 2-phase (same as world)    |
 * | reaction     | #f0ad4e   | 4-dir swipe (phase 2)      |
 * | interlude    | #6b6760   | no choices, auto-advance   |
 * | conversation | #c9a55a   | 3-beat tap choices          |
 * | district     | #f0ad4e   | 4-dir swipe                |
 */
export type AgencyType =
  | 'world'
  | 'petition'
  | 'personal'
  | 'action'
  | 'crisis'
  | 'reaction'
  | 'interlude'
  | 'conversation'
  | 'district';

/** Badge color mapping for each agency type. */
export const AGENCY_COLORS: Record<AgencyType, string> = {
  world: '#dc3545',
  petition: '#4a9eff',
  personal: '#8b5cf6',
  action: '#28a745',
  crisis: '#ff6b35',
  reaction: '#f0ad4e',
  interlude: '#6b6760',
  conversation: '#c9a55a',
  district: '#f0ad4e',
};

// ---------------------------------------------------------------------------
// Defining Traits (from onboarding card 6)
// ---------------------------------------------------------------------------

/**
 * Trait assigned during the origin sequence (Card 6: "What the Fire Revealed").
 * Affects future card text, NPC dialogue, and narrative framing.
 *
 * - `vendetta`  — "Hunt the guilty" path
 * - `reformer`  — "Rebuild and unite" path
 * - `ambitious` — "Seize the moment" path
 * - `guardian`  — "Protect the innocent" path
 */
export type DefiningTrait = 'vendetta' | 'reformer' | 'ambitious' | 'guardian';

// ---------------------------------------------------------------------------
// World / Setting
// ---------------------------------------------------------------------------

/**
 * A playable world setting selected at the world_select screen.
 */
export interface World {
  /** Unique world identifier. */
  id: string;
  /** Display name (e.g. "Kingdom of Vael"). */
  name: string;
  /** Genre tag (e.g. "Medieval Fantasy"). */
  setting: string;
  /** Emoji icon for prototype display. */
  icon: string;
  /** Theme color hex string. */
  color: string;
  /** Short description shown on world card. */
  description: string;
  /** Whether the world is available to the player. */
  locked: boolean;
}

// ---------------------------------------------------------------------------
// Game State
// ---------------------------------------------------------------------------

/**
 * Top-level game state. Drives the entire UI and card selector.
 */
export interface GameState {
  /** Current phase of the game. */
  phase: GamePhase;

  /** Selected world identifier. */
  worldId: string;

  /** Current week in the 48-week term (1-48). */
  week: number;

  /** Current act derived from week. */
  act: Act;

  /** Player's defining trait, set during origin card 6. Null until assigned. */
  trait: DefiningTrait | null;

  /**
   * Corruption score (0-100). Grows with extreme meter decisions
   * and morally questionable choices (e.g. blackmail, bribery).
   */
  corruption: number;

  /** Total cards played this term. */
  cardsPlayed: number;

  /** Whether the 8-card origin sequence has been completed. */
  originComplete: boolean;

  /** Index into the origin card sequence (0-7) during origin phase. */
  originCardIndex: number;

  /** Active tab in the main game UI. */
  activeTab: GameTab;
}

/**
 * Navigation tabs in the main game screen.
 * Unlocked progressively during origin.
 */
export type GameTab = 'home' | 'cards' | 'map' | 'court' | 'policy' | 'shop';

// ---------------------------------------------------------------------------
// Death
// ---------------------------------------------------------------------------

/**
 * Describes the cause of a player's death when a meter hits 0 or 100.
 */
export interface DeathCause {
  /** Which meter triggered the death. */
  meter: string;
  /** Whether the meter hit the low (0) or high (100) boundary. */
  direction: 'low' | 'high';
  /** Narrative text explaining the political consequence. */
  narrative: string;
}

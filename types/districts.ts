/**
 * Sovereign — Territory & District Types
 *
 * Five districts form a parallel game layer with influence, unrest, and
 * prosperity stats. Districts generate crisis cards, spread unrest via
 * adjacency contagion, and drift toward instability if unmanaged.
 *
 * @see SOV_PRD_04_TERRITORY — district data model, adjacency, tick rules
 */

// ---------------------------------------------------------------------------
// District Identifiers
// ---------------------------------------------------------------------------

/**
 * The five districts of the kingdom.
 *
 * | ID      | Name             | Theme                              |
 * |---------|------------------|------------------------------------|
 * | capital | Capital          | Court intrigue, diplomatic incidents |
 * | market  | Market District  | Trade, merchants, economic crises  |
 * | temple  | Temple Quarter   | Faith, ideology, popular movements |
 * | docks   | The Docks        | Smuggling, foreign agents, labor   |
 * | slums   | The Slums        | Crime, plague, rebellion seeds     |
 */
export type DistrictId = 'capital' | 'market' | 'temple' | 'docks' | 'slums';

/** Ordered list of all district IDs for iteration. */
export const DISTRICT_IDS: DistrictId[] = [
  'capital',
  'market',
  'temple',
  'docks',
  'slums',
];

// ---------------------------------------------------------------------------
// District Definition (static data layer)
// ---------------------------------------------------------------------------

/**
 * Static district definition with starting values and map layout.
 * Used to initialize DistrictState at game start.
 */
export interface DistrictDef {
  /** Unique district identifier. */
  id: DistrictId;

  /** Display name (e.g. "Market District"). */
  name: string;

  /** Emoji icon for prototype display. */
  icon: string;

  /** Theme color hex string. */
  color: string;

  /** Map X position as percentage of container width. */
  x: number;

  /** Map Y position as percentage of container height. */
  y: number;

  /** Starting influence (0-100). */
  influence: number;

  /** Starting unrest (0-100). */
  unrest: number;

  /** Starting prosperity (0-100). */
  prosperity: number;

  /** Adjacent district IDs for contagion spread. */
  adj: DistrictId[];

  /** Narrative theme for card generation. */
  theme: string;
}

// ---------------------------------------------------------------------------
// District Runtime State
// ---------------------------------------------------------------------------

/**
 * Runtime district state during gameplay. Mutated by weekly ticks,
 * card effects, and NPC dispatch.
 */
export interface DistrictState {
  /** District identifier. */
  id: DistrictId;

  /** Player's faction influence (0-100). */
  influence: number;

  /** Instability level (0-100). */
  unrest: number;

  /** Economic health (0-100). */
  prosperity: number;

  /** NPC ID assigned to govern this district (null = unassigned). */
  assignedNpc: string | null;
}

// ---------------------------------------------------------------------------
// District Effects (applied by cards)
// ---------------------------------------------------------------------------

/**
 * A set of stat changes applied to a specific district by a card option.
 *
 * Example: Raiding the docks reduces unrest by 10 but prosperity by 5:
 * `{ id: "docks", unrest: -10, prosperity: -5 }`
 */
export interface DistrictFx {
  /** Target district. */
  id: DistrictId;

  /** Unrest delta (positive = more unstable). */
  unrest?: number;

  /** Prosperity delta (positive = more prosperous). */
  prosperity?: number;

  /** Influence delta (positive = more player control). */
  influence?: number;
}

// ---------------------------------------------------------------------------
// District Requirements (card conditions)
// ---------------------------------------------------------------------------

/**
 * District-state precondition for a card to be eligible in the card selector.
 *
 * The card is only available when the specified district's unrest meets
 * the minimum threshold. Used by district crisis cards.
 */
export interface DistrictReq {
  /** Target district to check. */
  id: DistrictId;

  /** Minimum unrest required for the card to appear. */
  unrestMin: number;
}

// ---------------------------------------------------------------------------
// District Visual Zones
// ---------------------------------------------------------------------------

/**
 * Unrest zone determines the visual indicator color on the map.
 *
 * - `low`    — unrest < 25: green border
 * - `medium` — unrest 25-50: amber border
 * - `high`   — unrest > 50: red border, pulse animation
 */
export type UnrestZone = 'low' | 'medium' | 'high';

// ---------------------------------------------------------------------------
// District Tick Constants
// ---------------------------------------------------------------------------

/** Unrest level above which contagion spreads to adjacent districts. */
export const CONTAGION_THRESHOLD = 30;

/** Fraction of unrest spread to each adjacent district per week. */
export const CONTAGION_RATE = 0.15;

/** Unrest gained per week by unmanaged (no NPC assigned) districts. */
export const DRIFT_UNREST = 2;

/** Prosperity lost per week by unmanaged districts. */
export const DRIFT_PROSPERITY = -1;

/**
 * District crisis card probability by act.
 * Scales with escalation: Act 1 = 20%, Act 2 = 40%, Act 3 = 60%.
 */
export const CRISIS_PROBABILITY_BY_ACT: Record<1 | 2 | 3, number> = {
  1: 0.2,
  2: 0.4,
  3: 0.6,
};

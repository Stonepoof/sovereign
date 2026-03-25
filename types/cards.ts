/**
 * Sovereign — Card System Types
 *
 * Cards are the atomic unit of gameplay. Each card carries an agency type,
 * up to 4 directional options, optional conditions, dice checks, and
 * district/NPC side-effects. Cards read from and write to the Memory system.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY section 3 — card type definitions, data schema
 * @see SOV_PRD_07_NARRATIVE_ENGINE — card selector, text resolver, flag system
 * @see SOV_PRD_08_ONBOARDING — origin card sequence
 */

import { AgencyType, Direction, WEP, DefiningTrait } from './game';
import { MeterEffects } from './meters';
import type { DistrictFx, DistrictReq } from './districts';
import type { NPCState } from './npcs';
import type { Memory } from './memory';

// ---------------------------------------------------------------------------
// Text Resolution
// ---------------------------------------------------------------------------

/**
 * Card text can be a static string or a function that resolves dynamically
 * against the current game context (memory, NPCs, trait).
 *
 * Functions are resolved at card load time by the text resolver.
 */
export type TextFunction = string | ((ctx: TextContext) => string);

/**
 * Context passed to TextFunction resolvers.
 * Contains everything needed to produce conditional card text.
 */
export interface TextContext {
  /** The narrative memory object (flags, choices, witnessed). */
  memory: Memory;
  /** All NPCs currently in the player's court. */
  npcs: NPCState[];
  /** Player's defining trait (null during early origin). */
  trait: DefiningTrait | null;
  /** Current week (1-48). */
  week: number;
  /** Current act (1, 2, or 3). */
  act: 1 | 2 | 3;
  /** Current corruption score (0-100). */
  corruption: number;
  /** Meter values keyed by meter name. */
  meters: Record<string, number>;
}

/**
 * Condition function that determines whether a card is available
 * to the card selector. Returns true if the card should be eligible.
 */
export type ConditionFn = (ctx: TextContext) => boolean;

/**
 * Flag setter can be a static array of flag strings or a function
 * that computes flags dynamically based on context.
 */
export type FlagSetter = string[] | ((ctx: TextContext) => string[]);

// ---------------------------------------------------------------------------
// Dice Checks
// ---------------------------------------------------------------------------

/** Valid dice types available in the game. */
export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

/**
 * A dice check attached to a card option.
 *
 * When a player selects an option with a dice check, the dice roll UI
 * appears. Success threshold = ceil(die_max * 0.5). Natural max = critical
 * success. Natural 1 = critical fail.
 *
 * - Success: full meter effects from `successMeters`
 * - Failure: 30% of meter effects from `failMeters`
 */
export interface DiceCheck {
  /** Which die to roll. */
  die: DieType;

  /** Modifier added to the roll (default +2). */
  modifier: number;

  /** Meter effects applied on success (full potency). */
  successMeters: MeterEffects;

  /** Meter effects applied on failure (30% potency). */
  failMeters: MeterEffects;

  /** Narrative text shown on success. */
  successText?: TextFunction;

  /** Narrative text shown on failure. */
  failText?: TextFunction;
}

/**
 * Result of a dice roll after resolution.
 */
export interface DiceResult {
  /** The die that was rolled. */
  die: DieType;
  /** Natural roll (before modifier). */
  natural: number;
  /** Modifier applied. */
  modifier: number;
  /** Total = natural + modifier. */
  total: number;
  /** Success threshold that was required. */
  threshold: number;
  /** Whether the roll succeeded. */
  success: boolean;
  /** Whether this was a critical (natural max or natural 1). */
  critical: boolean;
}

/**
 * States for the dice roll animation state machine.
 *
 * WAITING -> tap -> ROLLING (shake animation, 20 random numbers at 45ms)
 *   -> RESULT_SHOWN (display result, success/fail color)
 *   -> auto-advance 1.8s OR tap to skip
 */
export type DiceState = 'waiting' | 'rolling' | 'result_shown';

// ---------------------------------------------------------------------------
// Card Options
// ---------------------------------------------------------------------------

/**
 * A single swipe option on a card. Each card can have up to 4 options,
 * one per direction.
 */
export interface CardOption {
  /** Direction this option is bound to. */
  direction: Direction;

  /** Short label shown during swipe preview (e.g. "Side with Lord Marsh"). */
  label: TextFunction;

  /**
   * Longer subtitle / description text shown in the impact summary.
   * Can be conditional on game state.
   */
  sub: TextFunction;

  /** Meter effects applied when this option is chosen. */
  meters: MeterEffects;

  /** Narrative text shown in the impact summary after choosing. */
  narr?: TextFunction;

  /** Narrative shown on dice success (overrides narr). */
  successNarr?: TextFunction;

  /** Narrative shown on dice failure (overrides narr). */
  failNarr?: TextFunction;

  /** Optional dice check triggered when this option is chosen. */
  dice?: DiceCheck;

  /** Flags set when this option is chosen. */
  setFlags?: string[];

  /** NPC loyalty effect. */
  npcEffect?: { name: string; delta: number };

  /** NPC to recruit when this option is chosen (origin/faction cards). */
  npcRecruit?: {
    name: string;
    role: string;
    faction?: string;
    loyalty: number;
  };

  /** District side-effect applied when this option is chosen. */
  districtFx?: DistrictFx;

  /** Policy shift applied (future implementation). */
  policyShift?: { id: string; delta: number };

  /** Corruption change when this option is chosen. */
  corrupt?: number;

  /** Trait assigned by this option (origin card 6 only). */
  trait?: DefiningTrait;

  /** Meter to reveal as part of progressive disclosure (origin). */
  revealMeter?: string;

  /** Card ID to queue as a follow-up after this option resolves. */
  followUp?: string;
}

// ---------------------------------------------------------------------------
// Base Card
// ---------------------------------------------------------------------------

/**
 * Core card definition — the atomic unit of gameplay.
 *
 * Every card has an agency type that determines its render component,
 * tonal voice, badge color, and interaction model.
 */
export interface Card {
  /** Unique card identifier (e.g. "p_taxes", "w_border", "fu_scandal"). */
  id: string;

  /** Agency type — determines render, tone, and badge. */
  agency: AgencyType;

  /** Card title text. */
  title: TextFunction;

  /** Emoji portrait shown on the card (prototype). */
  portrait: string;

  /** Emoji art for card illustrations (used in origin cards). */
  art?: string;

  /** NPC name displayed on the card (if card is NPC-driven). */
  npc?: string;

  /** Main body text. Can be conditional via TextFunction. */
  text: TextFunction;

  /**
   * Narration text for world/crisis cards (phase 1).
   * Shown in the WorldNarration component before the player responds.
   */
  narration?: TextFunction;

  /**
   * Meters automatically applied during the narration phase
   * of world/crisis events (before the player swipes).
   */
  autoMeters?: MeterEffects;

  /** Up to 4 directional options. */
  left?: CardOption;
  right?: CardOption;
  up?: CardOption;
  down?: CardOption;

  /** Condition function for card availability in the selector. */
  condition?: ConditionFn;

  /** Whether this card uses 2-phase world event rendering. */
  worldEvent?: boolean;

  /** World event phase hint (null for standard cards). */
  wep?: WEP;

  /** District effect applied when card resolves (any option). */
  districtEffect?: DistrictFx;

  /** District state required for this card to be eligible. */
  districtReq?: DistrictReq;

  /** Flags set after any swipe on this card. */
  setFlags?: FlagSetter;

  /**
   * Priority for the card selector (1 = highest, 5 = lowest).
   * Follow-ups default to 1, base cards to 5.
   */
  priority?: number;

  /** If true, card can only be played once per term. */
  once?: boolean;

  /** Tags for categorization and filtering. */
  tags?: string[];

  // -- Origin-specific fields -----------------------------------------------

  /** What UI element to reveal after this origin card (e.g. "firstMeter"). */
  reveal?: string;

  /** Whether this is the final origin card (triggers phase transition). */
  final?: boolean;
}

// ---------------------------------------------------------------------------
// Interlude Card (no choices, auto-advance)
// ---------------------------------------------------------------------------

/**
 * Interlude cards show the player information their character doesn't know.
 * They create dramatic irony. No choices — text auto-advances.
 *
 * Timing: max(4000, 3000 + wordCount * 70) ms.
 * Player can tap to skip.
 */
export interface InterludeCard {
  /** Unique interlude identifier. */
  id: string;

  /** Always 'interlude'. */
  agency: 'interlude';

  /** Title of the interlude. */
  title: TextFunction;

  /** Interlude narrative text. */
  text: TextFunction;

  /** Condition for injection by card selector (every 8th card). */
  condition?: ConditionFn;

  /** Flags set on completion. */
  setFlags?: string[];

  /** Duration override in ms (otherwise calculated from word count). */
  duration?: number;

  /** Tags for categorization. */
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Conversation Card (3-beat visual novel)
// ---------------------------------------------------------------------------

/**
 * Conversation cards are 3-beat visual novel segments embedded in the
 * card stream. They use portrait + dialogue + tap-to-select instead of swipe.
 *
 * Injected by the card selector every 6th card when conditions are met.
 */
export interface ConversationCard {
  /** Unique conversation identifier (e.g. "conv_elara"). */
  id: string;

  /** Always 'conversation'. */
  agency: 'conversation';

  /** NPC display name. */
  npcName: string;

  /** NPC identifier for state lookup. */
  npcId: string;

  /** Emoji portrait (prototype) / image path (production). */
  portrait: string;

  /** Condition for injection into the deck. */
  condition?: ConditionFn;

  /** The 3 dialogue beats. */
  beats: ConvoBeat[];

  /** Flags set on conversation completion. */
  setFlags?: string[];

  /** Loyalty bonus calculation: loyalty += perRapport * totalRapport. */
  loyaltyBonus: { name: string; perRapport: number };
}

/**
 * A single dialogue beat in a conversation (1 of 3).
 * Contains the NPC's line and 2-3 response options.
 */
export interface ConvoBeat {
  /**
   * NPC dialogue text. Can be a function of accumulated rapport
   * to enable conditional revelations (beats 2-3).
   */
  speaker: string | ((rapport: number) => string);

  /** Player response options (typically 2-3). */
  options: ConvoOption[];
}

/**
 * A single response option within a conversation beat.
 */
export interface ConvoOption {
  /** Player's response text. */
  label: string;

  /**
   * Rapport points awarded (0, 1, or 2).
   * Maximum possible per conversation: 6 (2 per beat * 3 beats).
   */
  rapport: number;

  /** NPC's reaction text shown after the player selects this option. */
  reaction: TextFunction;

  /** Optional meter effects from this response choice. */
  meters?: MeterEffects;

  /** Optional flags set by this response. */
  setFlags?: string[];
}

/**
 * Result summary shown after a conversation completes.
 */
export interface ConvoResult {
  /** NPC name. */
  npcName: string;

  /** Total rapport accumulated across all 3 beats (0-6). */
  totalRapport: number;

  /** Loyalty change applied (perRapport * totalRapport). */
  loyaltyChange: number;

  /** Accumulated meter effects from chosen responses. */
  meterEffects: MeterEffects;

  /** Quality label based on rapport thresholds. */
  quality: 'cold' | 'good' | 'excellent';
}

// ---------------------------------------------------------------------------
// Impact Summary
// ---------------------------------------------------------------------------

/**
 * Impact summary shown after every swipe card decision.
 * Auto-advances based on text length: max(3000, 2000 + words * 60) ms.
 */
export interface ImpactSummary {
  /** Direction the player swiped. */
  direction: Direction;

  /** The label of the chosen option. */
  choiceLabel: string;

  /** Narrative resolution text. */
  narrative: string;

  /** Meter changes applied. */
  meterDeltas: { meter: string; amount: number }[];

  /** Dice result if a dice check was involved. */
  diceResult?: DiceResult;

  /** District effects if any. */
  districtEffect?: DistrictFx;

  /** NPC loyalty change if any. */
  npcEffect?: { name: string; delta: number };
}

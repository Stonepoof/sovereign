// ─── Card Types ───────────────────────────────────────────────────────────

import { MeterEffects, MeterName, MeterDelta } from './meters';
import { AgencyType, Direction, DefiningTrait } from './game';
import { DistrictId } from './districts';

/** Context object passed to text functions for dynamic card text */
export interface TextContext {
  playerName: string;
  trait: DefiningTrait;
  turn: number;
  meters: Record<MeterName, number>;
  district?: DistrictId;
  /** Any recruited NPC IDs */
  recruitedNpcs: string[];
}

/** A function that generates text dynamically based on game state */
export type TextFunction = string | ((ctx: TextContext) => string);

/** A condition function that determines if a card should appear */
export type ConditionFn = (ctx: TextContext) => boolean;

/** Dice check definition for skill-check cards */
export interface DiceCheck {
  /** Target number to meet or exceed (1-20) */
  target: number;
  /** Which meter modifies the roll */
  modifier?: MeterName;
  /** Effects on success */
  successEffects: MeterEffects;
  /** Effects on failure */
  failureEffects: MeterEffects;
  /** Text shown on success */
  successText: string;
  /** Text shown on failure */
  failureText: string;
}

/** A single option the player can choose (mapped to a swipe direction) */
export interface CardOption {
  direction: Direction;
  label: TextFunction;
  effects: MeterEffects;
  /** Optional agency type override (defaults to card's agency) */
  agency?: AgencyType;
  /** Optional dice check */
  diceCheck?: DiceCheck;
  /** Optional follow-up card ID */
  followUp?: string;
  /** Text shown after choosing this option */
  resultText?: TextFunction;
}

/** Base card interface */
export interface Card {
  id: string;
  type: 'origin' | 'base' | 'crisis' | 'district' | 'followup';
  title: TextFunction;
  text: TextFunction;
  speaker?: string;
  agency: AgencyType;
  options: CardOption[];
  /** Condition for this card to appear in the deck */
  condition?: ConditionFn;
  /** Weight for random selection (higher = more likely) */
  weight?: number;
  /** Tags for filtering/grouping */
  tags?: string[];
  /** Minimum turn for this card to appear */
  minTurn?: number;
  /** Maximum times this card can appear per run */
  maxPlays?: number;
}

/** Game card option with MeterDelta array effects */
export interface GameCardOption {
  direction: Direction;
  label: string;
  effects: MeterDelta[];
  requiresDice?: boolean;
}

/** Game card used by the runtime game loop */
export interface GameCard {
  id: string;
  type: string;
  title: string;
  narrative: string;
  agency?: AgencyType;
  options: GameCardOption[];
}

/** Origin card (alias for GameCard with type 'origin') */
export type OriginCard = GameCard;

/** Interlude card — narrative pause between rounds */
export interface InterludeCard {
  id: string;
  type: 'interlude';
  title: TextFunction;
  text: TextFunction;
  /** Optional meter snapshot commentary */
  meterCommentary?: Partial<Record<MeterName, { low: string; mid: string; high: string }>>;
  /** Duration in milliseconds before auto-advancing (0 = manual) */
  duration?: number;
  condition?: ConditionFn;
}

/** A single beat in a conversation */
export interface ConversationBeat {
  speaker: string;
  text: TextFunction;
  /** Optional player response choices */
  responses?: {
    label: string;
    effects: MeterEffects;
    nextBeat?: number;
  }[];
}

/** Conversation card — multi-beat NPC dialogue */
export interface ConversationCard {
  id: string;
  type: 'conversation';
  npcId: string;
  title: string;
  beats: ConversationBeat[];
  condition?: ConditionFn;
  /** Effects applied after conversation completes */
  completionEffects?: MeterEffects;
}

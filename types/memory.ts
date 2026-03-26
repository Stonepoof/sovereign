// ─── Memory / Persistence Types ───────────────────────────────────────────

import { MeterName } from './meters';
import { DefiningTrait, GamePhase, Choice } from './game';

/** Saved game state for persistence */
export interface SavedGame {
  version: number;
  timestamp: number;
  playerName: string;
  trait: DefiningTrait;
  turn: number;
  phase: GamePhase;
  meters: Record<MeterName, number>;
  choices: Choice[];
  recruitedNpcs: string[];
  completedCards: string[];
  currentWorld: string;
  /** Districts unrest/prosperity/loyalty snapshots */
  districts: Record<string, { unrest: number; prosperity: number; loyalty: number }>;
}

/** Run summary saved after game over */
export interface RunSummary {
  id: string;
  timestamp: number;
  playerName: string;
  trait: DefiningTrait;
  turnsLasted: number;
  causeOfDeath: string;
  finalMeters: Record<MeterName, number>;
  totalChoices: number;
  world: string;
}

/** Player progression across runs */
export interface PlayerProgression {
  totalRuns: number;
  bestRun: number;
  unlockedWorlds: string[];
  unlockedTraits: DefiningTrait[];
  achievements: string[];
}

// ─── NPC Types ────────────────────────────────────────────────────────────

import { FactionId, AgencyType } from './game';
import { MeterEffects } from './meters';

/** Voice profile for AI-generated NPC dialogue */
export interface VoiceProfile {
  id: string;
  name: string;
  vocabulary: string[];
  sentenceLength: 'short' | 'medium' | 'long';
  traits: string[];
}

/** NPC definition (static config) */
export interface NPCDef {
  id: string;
  name: string;
  title: string;
  faction: FactionId;
  agency: AgencyType;
  description: string;
  voiceProfileId: string;
  recruitable: boolean;
  /** Meter effects when this NPC is recruited as advisor */
  advisorEffects?: MeterEffects;
  /** Personality traits for AI dialogue generation */
  personality: string[];
  /** Portrait description for potential image gen */
  portrait: string;
}

/** Runtime NPC state */
export interface NPCState {
  id: string;
  recruited: boolean;
  loyalty: number;    // 0-100
  lastSpokeTurn: number;
  conversationCount: number;
  /** Remembered facts about player interactions */
  memories: string[];
}

/** Simplified NPC type used by the game store and components */
export interface NPC {
  id: string;
  name: string;
  role: string;
  loyalty: number;
  faction: FactionId;
  recruited: boolean;
}

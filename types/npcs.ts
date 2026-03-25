/**
 * Sovereign — Court & NPC Types
 *
 * NPCs are named characters with loyalty scores, faction affiliations,
 * distinct voice profiles, and potential for dispatch to districts.
 * Loyalty ranges from 0-100 and drives behavioral thresholds from
 * Devoted (80+) through Hostile (0-19).
 *
 * @see SOV_PRD_05_COURT_NPC — roster, loyalty, voice profiles, factions, missions
 */

// ---------------------------------------------------------------------------
// Faction Identifiers
// ---------------------------------------------------------------------------

/**
 * Political factions that NPCs can belong to.
 * Faction-aligned decisions boost/hurt all members of a faction.
 *
 * | Faction  | Values                              |
 * |----------|-------------------------------------|
 * | reform   | Schools, lower taxes, diplomacy     |
 * | military | Army funding, quarantine, strength  |
 * | populist | Addressing grievances, people first |
 */
export type FactionId = 'reform' | 'military' | 'populist';

// ---------------------------------------------------------------------------
// Voice Profiles
// ---------------------------------------------------------------------------

/**
 * Voice profile keys matching the 7 defined NPC voices in PRD_05.
 */
export type VoiceKey = 'aldric' | 'elder' | 'spy' | 'kira' | 'elara' | 'voss' | 'maren';

/**
 * Describes an NPC's speech patterns for narrative text generation.
 * Each NPC has a unique voice that affects how card text reads.
 */
export interface VoiceProfile {
  /** Voice key identifier. */
  key: VoiceKey;

  /** Formality level description (e.g. "High formal", "Military protocol"). */
  formality: string;

  /** Speech rhythm description (e.g. "Measured, careful pauses"). */
  rhythm: string;

  /** Characteristic speech pattern (e.g. "Always says 'Sovereign'"). */
  verbalTic: string;

  /** Hidden personality trait revealed through high-trust interactions. */
  hiddenTrait: string;

  /** Vocabulary register. */
  vocabulary: 'formal' | 'casual' | 'archaic' | 'street' | 'military' | 'political' | 'plain';

  /** Typical sentence length in NPC dialogue. */
  sentenceLength: 'short' | 'medium' | 'long';

  /** Personality descriptors for text generation. */
  traits: string[];

  /** Optional speech quirk pattern. */
  quirk?: string;
}

// ---------------------------------------------------------------------------
// NPC Definition (static data layer)
// ---------------------------------------------------------------------------

/**
 * Static NPC definition used at the data layer.
 * Contains all immutable character information.
 */
export interface NPCDef {
  /** Display name (e.g. "General Kira", "Senator Voss"). */
  name: string;

  /** Court role (e.g. "Commander", "Faction Leader", "Mentor"). */
  role: string;

  /** Faction affiliation (null = independent). */
  faction: FactionId | null;

  /** Voice profile key (null if no custom voice). */
  voiceKey: VoiceKey | null;

  /** Emoji portrait for prototype display. */
  portrait: string;

  /** Character backstory text. */
  backstory: string;

  /** Starting loyalty when recruited (typically 40-60). */
  startingLoyalty: number;

  /**
   * Description of when/how the NPC is recruited.
   * e.g. "Origin card 7 (if Reform)" or "Slums Uprising card"
   */
  recruitedAt: string;

  /** Week number when NPC becomes available (0 = during origin). */
  recruitWeek: number;

  /** Optional mission description (future implementation). */
  mission?: string;
}

// ---------------------------------------------------------------------------
// NPC Runtime State
// ---------------------------------------------------------------------------

/**
 * Runtime NPC state during gameplay. Extends the minimal data needed
 * for card text resolution and gameplay mechanics.
 */
export interface NPC {
  /** Display name. */
  name: string;

  /** Current loyalty (0-100). */
  loy: number;

  /** Court role. */
  role: string;

  /** Faction affiliation. */
  faction?: FactionId;

  /** District ID if deployed (null/undefined = at court). */
  district?: string;
}

/**
 * Full NPC state with tracking fields for the court system.
 */
export interface NPCState extends NPC {
  /** Whether this NPC has been recruited into the court. */
  recruited: boolean;

  /** Whether this NPC is currently dispatched to a district. */
  dispatched: boolean;

  /** Number of conversations completed with this NPC. */
  conversations: number;

  /** Emoji portrait. */
  portrait: string;

  /** Voice profile key for dialogue generation. */
  voiceKey: VoiceKey | null;
}

// ---------------------------------------------------------------------------
// Loyalty Thresholds
// ---------------------------------------------------------------------------

/**
 * Loyalty behavioral tiers that determine NPC card generation and behavior.
 *
 * | Range  | Tier       | Behavior                                  |
 * |--------|------------|-------------------------------------------|
 * | 80-100 | Devoted    | Shares secrets, warns of danger            |
 * | 60-79  | Loyal      | Reliable ally, supportive                  |
 * | 40-59  | Neutral    | Cooperative but watching                   |
 * | 20-39  | Suspicious | Critical, may refuse orders                |
 * | 0-19   | Hostile    | Actively working against you, betrayal     |
 */
export type LoyaltyTier = 'devoted' | 'loyal' | 'neutral' | 'suspicious' | 'hostile';

/** Loyalty threshold boundaries. */
export const LOYALTY_THRESHOLDS = {
  devoted: 80,
  loyal: 60,
  neutral: 40,
  suspicious: 20,
  hostile: 0,
} as const;

// ---------------------------------------------------------------------------
// NPC Effects (applied by cards)
// ---------------------------------------------------------------------------

/**
 * Loyalty change applied to a specific NPC by a card option.
 */
export interface NPCEffect {
  /** NPC name to target. */
  name: string;

  /** Signed loyalty delta (-15 to +15 typical range). */
  delta: number;
}

// ---------------------------------------------------------------------------
// NPC Missions (future implementation)
// ---------------------------------------------------------------------------

/**
 * Mission that can be assigned to an NPC.
 * NPCs deployed on missions are removed from the court card pool.
 */
export interface NPCMission {
  /** Unique mission identifier. */
  id: string;

  /** Mission display name. */
  name: string;

  /** Skill required (e.g. "diplomacy", "military", "stealth"). */
  requiredSkill: string;

  /** Difficulty rating (1-5). */
  difficulty: number;

  /** Duration in weeks (3-8). */
  duration: number;

  /** Target district if this is a district mission. */
  districtId?: string;

  /** Description of the mission objective. */
  description: string;

  /** Condition function for mission availability. */
  condition?: (ctx: any) => boolean;

  /** Rewards on success. */
  reward: {
    loyalty: number;
    meters?: Record<string, number>;
  };

  /** Penalties on failure. */
  risk: {
    failPenalty: Record<string, number>;
    npcDamage: number;
  };
}

// ---------------------------------------------------------------------------
// Faction Alignment
// ---------------------------------------------------------------------------

/**
 * Describes how a decision affects each faction's loyalty.
 * Used for batch loyalty updates when a faction-relevant decision is made.
 */
export interface FactionAlignment {
  reform?: number;
  military?: number;
  populist?: number;
}

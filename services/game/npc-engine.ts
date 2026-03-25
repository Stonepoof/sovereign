/**
 * Sovereign — NPC Engine
 *
 * NPC loyalty calculation, voice profile text transformation,
 * and faction alignment aggregation.
 *
 * All functions are pure — no side effects, no mutations.
 *
 * @see SOV_PRD_05_COURT_NPC — loyalty tiers, voice profiles, factions
 */

import type {
  LoyaltyTier,
  VoiceProfile,
  NPCState,
  FactionId,
} from '../../types';

// ---------------------------------------------------------------------------
// Loyalty Tier Calculation
// ---------------------------------------------------------------------------

/**
 * Determine the loyalty tier for a given loyalty value.
 *
 * | Range  | Tier       |
 * |--------|------------|
 * | 80-100 | Devoted    |
 * | 60-79  | Loyal      |
 * | 40-59  | Neutral    |
 * | 20-39  | Suspicious |
 * | 0-19   | Hostile    |
 *
 * @param loyalty - NPC loyalty value (0-100).
 * @returns The corresponding LoyaltyTier.
 */
export function calculateLoyaltyTier(loyalty: number): LoyaltyTier {
  if (loyalty >= 80) return 'devoted';
  if (loyalty >= 60) return 'loyal';
  if (loyalty >= 40) return 'neutral';
  if (loyalty >= 20) return 'suspicious';
  return 'hostile';
}

// ---------------------------------------------------------------------------
// Voice Profile Application
// ---------------------------------------------------------------------------

/**
 * Apply an NPC's voice profile to a text string.
 *
 * Transformations based on vocabulary and sentenceLength:
 * - **formal**: Adds "Your Majesty, " prefix and formal phrasing.
 * - **archaic**: Replaces common words with archaic equivalents.
 * - **military**: Adds "Sovereign. " prefix and terse punctuation.
 * - **street**: Lowercases and adds casual markers.
 * - **casual**: Minor casualization.
 * - **political**: Adds hedging language.
 * - **plain**: No transformation.
 *
 * Sentence length adjustments:
 * - **short**: Truncates at the first sentence if text has multiple.
 * - **long**: No truncation (text used as-is).
 * - **medium**: No truncation.
 *
 * This is a simple prototype transformation. A production implementation
 * would use LLM-based voice synthesis.
 *
 * @param text - The raw text to transform.
 * @param voice - The NPC's voice profile.
 * @returns Transformed text reflecting the NPC's speech patterns.
 */
export function applyVoice(text: string, voice: VoiceProfile): string {
  if (!text) return text;

  let result = text;

  // --- Vocabulary transformation ---
  switch (voice.vocabulary) {
    case 'formal':
      // Prefix with formal address if not already present
      if (!result.startsWith('Your Majesty')) {
        result = `Your Majesty, ${lowerFirst(result)}`;
      }
      break;

    case 'archaic':
      result = result
        .replace(/\byou\b/gi, 'thee')
        .replace(/\byour\b/gi, 'thy')
        .replace(/\bis\b/g, "'tis")
        .replace(/\bdo not\b/gi, 'doth not')
        .replace(/\bmy lord\b/gi, 'my liege');
      break;

    case 'military':
      if (!result.startsWith('Sovereign')) {
        result = `Sovereign. ${result}`;
      }
      // Replace soft language with direct language
      result = result
        .replace(/\bperhaps\b/gi, '')
        .replace(/\bmaybe\b/gi, '')
        .replace(/\bI think\b/gi, 'Assessment:')
        .trim()
        .replace(/\s{2,}/g, ' ');
      break;

    case 'street':
      result = lowerFirst(result);
      result = result
        .replace(/\bthe authorities\b/gi, 'the crowns')
        .replace(/\bthe treasury\b/gi, 'the coffers')
        .replace(/\bnoble\b/gi, 'highborn');
      break;

    case 'casual':
      result = lowerFirst(result);
      break;

    case 'political':
      if (!result.includes('consider') && !result.includes('perhaps')) {
        result = `Perhaps we should consider — ${lowerFirst(result)}`;
      }
      break;

    case 'plain':
    default:
      // No transformation
      break;
  }

  // --- Sentence length adjustment ---
  if (voice.sentenceLength === 'short') {
    // Keep only the first sentence
    const firstSentence = result.match(/^[^.!?]+[.!?]/);
    if (firstSentence) {
      result = firstSentence[0];
    }
  }

  // --- Quirk application ---
  if (voice.quirk) {
    // Append quirk as a trailing speech pattern if short enough
    if (voice.quirk.length < 40 && !result.endsWith(voice.quirk)) {
      result = `${result.replace(/[.!?]$/, '')}... ${voice.quirk}`;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Faction Alignment
// ---------------------------------------------------------------------------

/**
 * Aggregate NPC loyalty by faction.
 *
 * For each faction, computes the average loyalty of all recruited NPCs
 * belonging to that faction. NPCs without a faction are excluded.
 *
 * @param npcs - All NPC states in the game.
 * @returns Record mapping each faction to its average loyalty (0-100).
 */
export function getFactionAlignment(npcs: NPCState[]): Record<FactionId, number> {
  const factions: Record<FactionId, { total: number; count: number }> = {
    reform: { total: 0, count: 0 },
    military: { total: 0, count: 0 },
    populist: { total: 0, count: 0 },
  };

  for (const npc of npcs) {
    if (!npc.recruited || !npc.faction) continue;

    const faction = factions[npc.faction];
    if (faction) {
      faction.total += npc.loy;
      faction.count += 1;
    }
  }

  return {
    reform: factions.reform.count > 0
      ? Math.round(factions.reform.total / factions.reform.count)
      : 0,
    military: factions.military.count > 0
      ? Math.round(factions.military.total / factions.military.count)
      : 0,
    populist: factions.populist.count > 0
      ? Math.round(factions.populist.total / factions.populist.count)
      : 0,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Lowercase the first character of a string. */
function lowerFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

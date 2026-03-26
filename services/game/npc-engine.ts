// ─── NPC Engine ───────────────────────────────────────────────────────────
// Pure functions for NPC loyalty, voice application, faction alignment.

import { NPCState, NPCDef, FactionId, VoiceProfile, MeterEffects } from '../../types';

// ─── Loyalty Tiers ────────────────────────────────────────────────────────

export type LoyaltyTier = 'devoted' | 'loyal' | 'neutral' | 'disgruntled' | 'hostile';

export function calculateLoyaltyTier(loyalty: number): LoyaltyTier {
  if (loyalty >= 80) return 'devoted';
  if (loyalty >= 60) return 'loyal';
  if (loyalty >= 40) return 'neutral';
  if (loyalty >= 20) return 'disgruntled';
  return 'hostile';
}

// ─── Voice Application ────────────────────────────────────────────────────

/**
 * Apply voice characteristics to a text string.
 * Uses VoiceProfile traits to modulate sentence style.
 */
export function applyVoice(text: string, voice: VoiceProfile): string {
  let result = text;

  // Short sentences for 'short' sentence length profiles
  if (voice.sentenceLength === 'short' && result.length > 80) {
    // Trim to first sentence if too long
    const firstPeriod = result.indexOf('. ');
    if (firstPeriod > 0 && firstPeriod < 80) {
      result = result.slice(0, firstPeriod + 1);
    }
  }

  // Inject vocabulary words occasionally (10% chance per word)
  if (voice.vocabulary.length > 0 && Math.random() < 0.1) {
    const word = voice.vocabulary[Math.floor(Math.random() * voice.vocabulary.length)];
    result = `${result} ${word}.`;
  }

  return result;
}

// ─── Faction Alignment ────────────────────────────────────────────────────

/** How much a faction cares about each meter (weight 0-1) */
const FACTION_WEIGHTS: Partial<Record<FactionId, Record<string, number>>> = {
  crown:      { authority: 0.9, stability: 0.7, treasury: 0.4, military: 0.3, populace: 0.2 },
  merchants:  { treasury: 0.9, populace: 0.5, stability: 0.5, authority: 0.2, military: 0.1 },
  merchant:   { treasury: 0.9, populace: 0.5, stability: 0.5, authority: 0.2, military: 0.1 },
  military:   { military: 0.9, authority: 0.6, stability: 0.4, treasury: 0.3, populace: 0.1 },
  clergy:     { populace: 0.7, stability: 0.7, authority: 0.3, treasury: 0.2, military: 0.1 },
  faith:      { populace: 0.7, stability: 0.7, authority: 0.3, treasury: 0.2, military: 0.1 },
  underworld: { treasury: 0.5, authority: 0.3, stability: 0.2, military: 0.4, populace: 0.1 },
  shadow:     { treasury: 0.5, authority: 0.3, stability: 0.2, military: 0.4, populace: 0.1 },
  commoners:  { populace: 0.9, treasury: 0.4, stability: 0.5, authority: 0.1, military: 0.1 },
};

/**
 * Calculate how aligned a set of meter changes are with an NPC's faction.
 * Returns a value from -1 (strongly against) to +1 (strongly aligned).
 */
export function getFactionAlignment(
  faction: FactionId,
  meterDeltas: MeterEffects,
): number {
  const weights = FACTION_WEIGHTS[faction];
  if (!weights) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [meter, delta] of Object.entries(meterDeltas)) {
    if (delta === undefined) continue;
    const weight = weights[meter] ?? 0;
    if (weight > 0) {
      const normalized = Math.max(-1, Math.min(1, delta / 20));
      weightedSum += normalized * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

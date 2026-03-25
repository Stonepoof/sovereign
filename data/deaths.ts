/**
 * Sovereign — Death Narratives
 *
 * 10 unique death narratives, one for each meter direction (low/high x 5 meters).
 * Each meter reaching 0 or 100 triggers immediate death with a specific narrative
 * explaining HOW the death happened politically.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY section 6 — death system, narratives
 */

import type { MeterName } from '../types';

// ---------------------------------------------------------------------------
// Death Narrative Type
// ---------------------------------------------------------------------------

export interface DeathNarrative {
  id: string;
  meterName: MeterName;
  direction: 'low' | 'high';
  title: string;
  narrative: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// Death Narratives (all 10)
// ---------------------------------------------------------------------------

export const DEATHS: DeathNarrative[] = [
  // Authority
  {
    id: 'death_authority_low',
    meterName: 'authority',
    direction: 'low',
    title: 'Overthrown',
    narrative:
      'A coalition of lords, generals, and merchants meets in secret. By dawn, the palace ' +
      'gates open from within. You find your throne occupied and your name struck from the ' +
      'records. You were not assassinated — merely forgotten.',
    icon: '👑',
  },
  {
    id: 'death_authority_high',
    meterName: 'authority',
    direction: 'high',
    title: 'The Tyrant Falls',
    narrative:
      'You ruled with an iron fist, and iron fists attract daggers. The poison was in the ' +
      'wine — or the ink, or the gloves. No one is sure. What they are sure of is that ' +
      'no one mourned.',
    icon: '🗡️',
  },

  // Populace
  {
    id: 'death_populace_low',
    meterName: 'populace',
    direction: 'low',
    title: "The People's Revolt",
    narrative:
      'The streets erupt. Not a riot — a revolution. The crowd does not shout demands; ' +
      'they shout your name as a curse. The palace burns with you inside. History will ' +
      'remember you as the last of the old order.',
    icon: '🔥',
  },
  {
    id: 'death_populace_high',
    meterName: 'populace',
    direction: 'high',
    title: 'Cult of Personality',
    narrative:
      'You gave the people everything they wanted, and they loved you for it. Your inner ' +
      'circle did not. While the crowds chanted your name, your closest advisors quietly ' +
      'removed you. A puppet sits on the throne now, smiling your smile.',
    icon: '🎭',
  },

  // Treasury
  {
    id: 'death_treasury_low',
    meterName: 'treasury',
    direction: 'low',
    title: 'Bankruptcy',
    narrative:
      'The coffers are empty. The soldiers have not been paid in three months. Foreign ' +
      'creditors arrive with armed escorts. Your kingdom is carved up like a debtor\'s ' +
      'estate. You sign the abdication with a borrowed pen.',
    icon: '💸',
  },
  {
    id: 'death_treasury_high',
    meterName: 'treasury',
    direction: 'high',
    title: 'Corruption Scandal',
    narrative:
      'Gold flowed freely — too freely. The ledgers reveal bribes, embezzlement, and ' +
      'phantom projects. When the scandal breaks, even your allies cannot defend the ' +
      'numbers. The trial is swift. The verdict is unanimous.',
    icon: '📜',
  },

  // Military
  {
    id: 'death_military_low',
    meterName: 'military',
    direction: 'low',
    title: 'Invasion',
    narrative:
      'Without a credible military, the border raiders became border settlers, then border ' +
      'conquerors. The generals you dismissed watched from exile as foreign banners rose ' +
      'over the capital. They did not lift a finger to help.',
    icon: '⚔️',
  },
  {
    id: 'death_military_high',
    meterName: 'military',
    direction: 'high',
    title: 'Military Coup',
    narrative:
      'You built the most powerful army the kingdom has ever seen. Then it decided it ' +
      'no longer needed a civilian ruler. General Kira — or was it someone else? — reads ' +
      'the decree. Martial law. Indefinitely. You are escorted to comfortable exile.',
    icon: '🛡️',
  },

  // Stability
  {
    id: 'death_stability_low',
    meterName: 'stability',
    direction: 'low',
    title: 'Civil War',
    narrative:
      'The center did not hold. Districts declared autonomy. Factions armed themselves. ' +
      'The kingdom fractured into five warring pieces, each claiming legitimacy. ' +
      'You are sovereign of nothing but the ruins of the capital.',
    icon: '💔',
  },
  {
    id: 'death_stability_high',
    meterName: 'stability',
    direction: 'high',
    title: 'Stagnation',
    narrative:
      'Order was your obsession. Every dissenter silenced, every variable controlled, every ' +
      'voice harmonized into obedient monotone. Parliament called it a no-confidence vote. ' +
      'In truth, confidence was all you had — and nothing else.',
    icon: '🔒',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find the death narrative for a given meter and direction. */
export function getDeathNarrative(
  meterName: MeterName,
  direction: 'low' | 'high',
): DeathNarrative | undefined {
  return DEATHS.find((d) => d.meterName === meterName && d.direction === direction);
}

// ─── Death Engine ─────────────────────────────────────────────────────────
// Checks meters for death conditions (0 or 100) and returns narrative context.
// Priority: stability > authority > populace > treasury > military

import { MeterName } from '../../types';

export interface DeathResult {
  meter: MeterName;
  direction: 'low' | 'high';
  narrative: string;
}

const DEATH_NARRATIVES: Record<MeterName, { low: string; high: string }> = {
  stability: {
    low: 'The kingdom crumbles into chaos. Without order, your throne becomes meaningless as rival factions tear the realm apart.',
    high: 'Your iron grip has crushed the spirit of your people. In their desperation, they rise as one to overthrow the tyrant.',
  },
  authority: {
    low: 'Your authority has evaporated. The court no longer heeds your decrees, and a bold pretender seizes the crown while you sleep.',
    high: 'Drunk on absolute power, you have become the very despot the people feared. Assassination comes swiftly and without warning.',
  },
  populace: {
    low: 'The people starve and suffer while you feast. Riots engulf the capital, and the mob drags you from the throne room.',
    high: 'The masses adore you so completely that the nobles feel threatened. A coalition of lords conspires to remove you before your populism undoes their power.',
  },
  treasury: {
    low: 'The coffers are bare. Unable to pay soldiers or servants, the machinery of state grinds to a halt. Creditors and enemies close in.',
    high: 'Your obsessive hoarding of wealth has starved every institution. The army mutinies, the temples close, and commerce withers.',
  },
  military: {
    low: 'Without a standing army, the borders fall. Foreign invaders march unopposed through your lands and claim your crown.',
    high: 'The generals have grown too powerful. They no longer serve the crown — they command it. A military coup ends your reign.',
  },
};

/** Check if any meter has reached a death condition. Returns null if alive. */
export function checkDeath(meters: Record<MeterName, number>): DeathResult | null {
  const priority: MeterName[] = ['stability', 'authority', 'populace', 'treasury', 'military'];

  for (const key of priority) {
    const val = meters[key];
    if (val <= 0) {
      return {
        meter: key,
        direction: 'low',
        narrative: DEATH_NARRATIVES[key].low,
      };
    }
    if (val >= 100) {
      return {
        meter: key,
        direction: 'high',
        narrative: DEATH_NARRATIVES[key].high,
      };
    }
  }

  return null;
}

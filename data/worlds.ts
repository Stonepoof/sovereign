/**
 * Sovereign — World Definitions
 *
 * Playable world settings selected at the world_select screen.
 * Vael is the default (free) medieval political setting.
 * Aethon and Nexus are planned IAP unlocks.
 *
 * @see SOV_PRD_01_OVERVIEW — elevator pitch, monetization (world unlocks $3.99)
 * @see SOV_PRD_08_ONBOARDING — world select is the first screen
 */

import type { World } from '../types';

// ---------------------------------------------------------------------------
// World Definitions
// ---------------------------------------------------------------------------

export const WORLDS: World[] = [
  {
    id: 'vael',
    name: 'Kingdom of Vael',
    setting: 'Medieval Fantasy',
    icon: '🏰',
    color: '#c9a55a',
    description:
      'A crumbling kingdom where five factions vie for influence. ' +
      'Your predecessor died under mysterious circumstances. ' +
      'The treasury is nearly empty. The borders are restless. ' +
      'You have 48 weeks to survive.',
    locked: false,
  },
  {
    id: 'aethon',
    name: 'Republic of Aethon',
    setting: 'Renaissance Intrigue',
    icon: '⚜️',
    color: '#4a9eff',
    description:
      'A mercantile republic where gold speaks louder than swords. ' +
      'Navigate trade wars, guild politics, and the machinations of ' +
      'a senate that would rather see you fail than succeed.',
    locked: true,
  },
  {
    id: 'nexus',
    name: 'The Nexus Compact',
    setting: 'Arcane Politics',
    icon: '🔮',
    color: '#8b5cf6',
    description:
      'A coalition of city-states bound by ancient magical treaties. ' +
      'Power flows through ley lines and arcane councils. ' +
      'When the magic falters, so does the peace.',
    locked: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get a world definition by ID. */
export function getWorldDef(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}

/** Get only unlocked worlds. */
export function getUnlockedWorlds(): World[] {
  return WORLDS.filter((w) => !w.locked);
}

/** Default world ID for new games. */
export const DEFAULT_WORLD_ID = 'vael';

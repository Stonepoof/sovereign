// ─── World Definitions ────────────────────────────────────────────────────

import { WorldDef } from '../types/game';

export const WORLDS: WorldDef[] = [
  {
    id: 'vael',
    name: 'Vael',
    description: 'A kingdom of ancient traditions and simmering tensions. The crown sits heavy on any head that wears it.',
    unlocked: true,
    difficulty: 'normal',
    cardPool: ['base', 'crisis', 'district', 'interlude', 'conversation'],
  },
  {
    id: 'aethon',
    name: 'Aethon',
    description: 'A confederacy of merchant states where gold speaks louder than steel. Every alliance has a price.',
    unlocked: false,
    difficulty: 'hard',
    cardPool: ['base', 'crisis', 'district', 'interlude', 'conversation'],
  },
  {
    id: 'nexus',
    name: 'Nexus',
    description: 'A realm where magic and technology collide. The old gods stir in their prisons beneath the earth.',
    unlocked: false,
    difficulty: 'nightmare',
    cardPool: ['base', 'crisis', 'district', 'interlude', 'conversation'],
  },
];

/** Get a world by ID */
export function getWorld(id: string): WorldDef | undefined {
  return WORLDS.find((w) => w.id === id);
}

/** Get all unlocked worlds */
export function getUnlockedWorlds(): WorldDef[] {
  return WORLDS.filter((w) => w.unlocked);
}

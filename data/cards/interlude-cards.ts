// ─── Interlude Cards ──────────────────────────────────────────────────────
// 5 narrative interludes between gameplay rounds.

import { InterludeCard } from '../../types/cards';

export const INTERLUDE_CARDS: InterludeCard[] = [
  {
    id: 'interlude_01_sunset',
    type: 'interlude',
    title: 'Sunset Over the Capital',
    text: 'You stand on the palace balcony as the sun sets. The city sprawls before you — beautiful and broken in equal measure. Fires glow in the slums. Lanterns glitter in the market. Somewhere, someone is making a decision about your future.',
    meterCommentary: {
      authority: {
        low: 'Your grip on power feels tenuous from up here.',
        mid: 'The crown sits steady. For now.',
        high: 'The city bends to your will. Every light a subject.',
      },
      populace: {
        low: 'The streets below are too quiet. Where is everyone?',
        mid: 'Life goes on. The people endure.',
        high: 'Laughter drifts up from the plazas. They love you tonight.',
      },
    },
    duration: 0,
  },
  {
    id: 'interlude_02_mirror',
    type: 'interlude',
    title: 'The Mirror',
    text: 'Alone in your chambers, you catch your reflection. The face staring back has aged years in weeks. Crow is what power does to a face. You straighten your spine and return to work.',
    duration: 0,
  },
  {
    id: 'interlude_03_old_map',
    type: 'interlude',
    title: 'The Old Map',
    text: 'You find a map in your predecessor\'s study. Notes in the margins reveal alliances long forgotten, debts never repaid, promises made to people now dead. History has a weight here that presses down on the present.',
    duration: 0,
    condition: (ctx) => ctx.turn >= 5,
  },
  {
    id: 'interlude_04_garden',
    type: 'interlude',
    title: 'The Royal Garden',
    text: 'You walk among the roses your predecessor planted. They bloom without care for politics. A gardener tends them silently — the same gardener who served the last three rulers. Some things outlast crowns.',
    meterCommentary: {
      stability: {
        low: 'Even the garden feels untended. Weeds creep between the stones.',
        mid: 'The garden is peaceful. A rare sanctuary from the chaos.',
        high: 'Every hedge is trimmed, every path swept. Order, at least, is beautiful.',
      },
    },
    duration: 0,
    condition: (ctx) => ctx.turn >= 3,
  },
  {
    id: 'interlude_05_stars',
    type: 'interlude',
    title: 'The Stars',
    text: 'Sleepless, you climb to the observatory tower. The stars don\'t care who rules below. An astronomer once told you that the light you see left its source a thousand years ago. Kingdoms rise and fall in that time. Yours is just beginning.',
    duration: 0,
    condition: (ctx) => ctx.turn >= 8,
  },
];

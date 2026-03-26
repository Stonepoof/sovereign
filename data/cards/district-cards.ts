// ─── District Cards ───────────────────────────────────────────────────────
// 5 cards tied to specific districts.

import { Card } from '../../types/cards';

export const DISTRICT_CARDS: Card[] = [
  {
    id: 'district_01_palace_intrigue',
    type: 'district',
    title: 'Palace Intrigue',
    text: 'A faction of courtiers in the Palace Quarter plots to elevate a distant relative to challenge your legitimacy. Your chancellor warns you over breakfast.',
    agency: 'decree',
    weight: 2,
    tags: ['palace'],
    options: [
      {
        direction: 'left',
        label: 'Exile the plotters',
        effects: { authority: 5, stability: -3, populace: -2 },
        resultText: 'The court thins. Those who remain are loyal — or better at hiding.',
      },
      {
        direction: 'right',
        label: 'Invite the relative to court and co-opt them',
        effects: { stability: 4, authority: -2, treasury: -3 },
        resultText: 'Keep your enemies close. Very close.',
      },
    ],
  },
  {
    id: 'district_02_market_fire',
    type: 'district',
    title: 'Market Fire',
    text: 'A devastating fire tears through the Grand Market. Hundreds of stalls are destroyed. The merchants demand compensation.',
    agency: 'commerce',
    weight: 2,
    tags: ['market'],
    options: [
      {
        direction: 'left',
        label: 'Fund the rebuilding from the treasury',
        effects: { treasury: -8, populace: 5, stability: 3 },
        resultText: 'A new market rises from the ashes, grander than before.',
      },
      {
        direction: 'right',
        label: 'Let the merchants rebuild themselves',
        effects: { treasury: 2, populace: -5, stability: -2 },
        resultText: 'The wealthy rebuild. The poor have nothing to rebuild with.',
      },
    ],
  },
  {
    id: 'district_03_barracks_mutiny',
    type: 'district',
    title: 'Barracks Unrest',
    text: 'Soldiers in the Barracks District are on the verge of mutiny. Pay is late, rations are thin, and a charismatic sergeant is stirring trouble.',
    agency: 'military',
    weight: 2,
    tags: ['barracks'],
    options: [
      {
        direction: 'left',
        label: 'Address the troops personally with promises',
        effects: { authority: 3, military: 4, treasury: -4 },
        resultText: 'Your presence calms the ranks. But promises must be kept.',
      },
      {
        direction: 'right',
        label: 'Arrest the sergeant and reassign agitators',
        effects: { military: -3, authority: 5, stability: 3 },
        resultText: 'Order is restored through discipline. Morale takes a hit.',
      },
    ],
  },
  {
    id: 'district_04_temple_miracle',
    type: 'district',
    title: 'The Miracle',
    text: 'Pilgrims claim a statue in the Temple District weeps golden tears. Thousands flock to see it. The priestess asks if you will come.',
    agency: 'faith',
    weight: 2,
    tags: ['temple'],
    options: [
      {
        direction: 'left',
        label: 'Visit and publicly declare it a miracle',
        effects: { populace: 6, stability: 4, authority: -3 },
        resultText: 'The faithful adore you. The scholars roll their eyes.',
      },
      {
        direction: 'right',
        label: 'Send investigators to examine the statue',
        effects: { stability: -3, authority: 4, populace: -3 },
        resultText: 'The investigators find clever plumbing. The clergy is embarrassed.',
      },
    ],
  },
  {
    id: 'district_05_slums_uprising',
    type: 'district',
    title: 'The Slums Revolt',
    text: 'The Outer Slums erupt in violence. A mob has barricaded the streets and taken a tax collector hostage. They demand food and justice.',
    agency: 'justice',
    weight: 2,
    tags: ['slums'],
    condition: (ctx) => ctx.meters.populace < 40,
    options: [
      {
        direction: 'left',
        label: 'Send in the soldiers',
        effects: { military: -2, populace: -6, stability: 4, authority: 4 },
        resultText: 'The revolt is crushed. The slums remember.',
      },
      {
        direction: 'right',
        label: 'Meet the mob leaders personally',
        effects: { populace: 6, authority: -4, stability: 2, treasury: -3 },
        resultText: 'You walk among the desperate. Your bravery earns their respect, if not their trust.',
      },
    ],
  },
];

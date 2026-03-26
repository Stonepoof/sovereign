// ─── Crisis Cards ─────────────────────────────────────────────────────────
// 6 crisis events that demand immediate response. Higher stakes.

import { Card } from '../../types/cards';

export const CRISIS_CARDS: Card[] = [
  {
    id: 'crisis_01_famine',
    type: 'crisis',
    title: 'CRISIS: The Great Famine',
    text: 'Blight has destroyed the harvest across three provinces. People are already dying. The granaries hold enough for the capital — barely.',
    agency: 'decree',
    weight: 1,
    minTurn: 6,
    maxPlays: 1,
    options: [
      {
        direction: 'left',
        label: 'Open the royal granaries to all',
        effects: { populace: 10, treasury: -10, military: -3, stability: -2 },
        resultText: 'The people survive. The capital goes hungry. Your soldiers grumble on empty stomachs.',
      },
      {
        direction: 'right',
        label: 'Ration strictly — capital first',
        effects: { stability: 5, military: 3, populace: -10, authority: 3 },
        resultText: 'The provinces starve while the capital eats. You will be remembered for this.',
      },
    ],
  },
  {
    id: 'crisis_02_coup_attempt',
    type: 'crisis',
    title: 'CRISIS: The Coup',
    text: 'Your spymaster bursts in at dawn. Three generals have seized the eastern barracks and declared you unfit to rule. They march on the capital.',
    agency: 'military',
    weight: 1,
    minTurn: 8,
    maxPlays: 1,
    condition: (ctx) => ctx.meters.military > 60 || ctx.meters.authority < 30,
    options: [
      {
        direction: 'left',
        label: 'Meet them on the field of battle',
        effects: { military: -8, authority: 10, stability: -5 },
        diceCheck: {
          target: 12,
          modifier: 'military',
          successEffects: { authority: 10, military: 5 },
          failureEffects: { authority: -15, military: -10 },
          successText: 'Your forces triumph! The traitors kneel.',
          failureText: 'The battle is a disaster. Your army is shattered.',
        },
        resultText: 'You ride out to face your betrayers.',
      },
      {
        direction: 'right',
        label: 'Negotiate — offer amnesty and reforms',
        effects: { authority: -5, stability: 5, military: 3, populace: 3 },
        resultText: 'The generals accept. Your mercy is seen as wisdom — or weakness.',
      },
    ],
  },
  {
    id: 'crisis_03_invasion',
    type: 'crisis',
    title: 'CRISIS: Foreign Invasion',
    text: 'The northern empire has crossed the border with a massive army. Your scouts estimate you are outnumbered three to one.',
    agency: 'military',
    weight: 1,
    minTurn: 10,
    maxPlays: 1,
    options: [
      {
        direction: 'left',
        label: 'Rally every able body to defend the realm',
        effects: { military: 8, populace: -6, treasury: -8, authority: 5 },
        resultText: 'Farmers become soldiers overnight. The cost in blood and gold will be immense.',
      },
      {
        direction: 'right',
        label: 'Seek terms of surrender',
        effects: { stability: 5, authority: -10, treasury: -5, populace: -5 },
        resultText: 'You kneel to save lives. Your crown becomes a symbol of submission.',
      },
      {
        direction: 'up',
        label: 'Scorched earth — burn everything in their path',
        effects: { military: 5, populace: -10, treasury: -5, stability: -5 },
        resultText: 'The invaders find only ash. So do your people.',
      },
    ],
  },
  {
    id: 'crisis_04_plague',
    type: 'crisis',
    title: 'CRISIS: The Crimson Plague',
    text: 'The sickness from the slums has spread. Bodies pile in the streets. The healers are overwhelmed. The clergy claims divine punishment.',
    agency: 'infrastructure',
    weight: 1,
    minTurn: 7,
    maxPlays: 1,
    options: [
      {
        direction: 'left',
        label: 'Quarantine the infected districts',
        effects: { stability: 5, populace: -8, treasury: -5, authority: 3 },
        resultText: 'The walls go up. Screams echo from within. The plague is contained — at terrible cost.',
      },
      {
        direction: 'right',
        label: 'Hire foreign physicians at any cost',
        effects: { treasury: -12, populace: 5, stability: 3 },
        resultText: 'The physicians bring new knowledge. The plague retreats. Your treasury does too.',
      },
    ],
  },
  {
    id: 'crisis_05_religious_schism',
    type: 'crisis',
    title: 'CRISIS: The Schism',
    text: 'The clergy has split in two. The reformists demand change; the traditionalists demand blood. Both sides look to you for support. Choosing wrong could ignite civil war.',
    agency: 'faith',
    weight: 1,
    minTurn: 8,
    maxPlays: 1,
    options: [
      {
        direction: 'left',
        label: 'Back the traditionalists',
        effects: { stability: 6, populace: -6, authority: 3 },
        resultText: 'The old order is preserved. The reformists go underground.',
      },
      {
        direction: 'right',
        label: 'Support the reformists',
        effects: { populace: 6, stability: -6, authority: -3 },
        resultText: 'Change sweeps through the temples. The old guard plots revenge.',
      },
      {
        direction: 'up',
        label: 'Declare religious freedom for all',
        effects: { populace: 4, stability: -3, authority: -5, treasury: -2 },
        resultText: 'Both sides hate you equally. But neither can claim divine mandate over the other.',
      },
    ],
  },
  {
    id: 'crisis_06_treasury_crisis',
    type: 'crisis',
    title: 'CRISIS: Bankruptcy',
    text: 'The treasury is nearly empty. Soldiers have not been paid in two months. Merchants refuse to extend credit. The kingdom teeters on financial collapse.',
    agency: 'commerce',
    weight: 1,
    minTurn: 6,
    maxPlays: 1,
    condition: (ctx) => ctx.meters.treasury < 25,
    options: [
      {
        direction: 'left',
        label: 'Seize noble estates to fill the coffers',
        effects: { treasury: 12, authority: -8, stability: -5, populace: 3 },
        resultText: 'The nobles are stripped bare. The common folk cheer. The aristocracy vows revenge.',
      },
      {
        direction: 'right',
        label: 'Accept a foreign loan with harsh terms',
        effects: { treasury: 8, authority: -5, stability: 3 },
        resultText: 'Gold flows in, but the strings attached could strangle your sovereignty.',
      },
    ],
  },
];

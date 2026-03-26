// ─── Origin Cards ─────────────────────────────────────────────────────────
// 8 onboarding cards that establish character and starting conditions.

import { Card } from '../../types/cards';

export const ORIGIN_CARDS: Card[] = [
  {
    id: 'origin_01_coronation',
    type: 'origin',
    title: 'The Coronation',
    text: 'The crown is placed upon your head. The weight is more than metal. The court watches — some with hope, others with calculation. How do you address them?',
    agency: 'decree',
    options: [
      {
        direction: 'left',
        label: 'Speak of duty and sacrifice',
        effects: { authority: 5, populace: 5, stability: 3 },
        resultText: 'Your solemn words echo through the hall. The old guard nods approvingly.',
      },
      {
        direction: 'right',
        label: 'Promise a new golden age',
        effects: { populace: 8, treasury: -3, authority: 2 },
        resultText: 'The crowd erupts in cheers. The treasury minister looks uneasy.',
      },
    ],
  },
  {
    id: 'origin_02_first_petitioner',
    type: 'origin',
    title: 'The First Petitioner',
    text: 'Before the throne room empties, a peasant pushes through the guards. She begs for grain — her village is starving. The nobles sneer.',
    agency: 'justice',
    options: [
      {
        direction: 'left',
        label: 'Send the grain immediately',
        effects: { populace: 8, treasury: -5, authority: -2 },
        resultText: 'The woman weeps with gratitude. The nobles whisper about weakness.',
      },
      {
        direction: 'right',
        label: 'Promise to investigate through proper channels',
        effects: { stability: 5, authority: 3, populace: -3 },
        resultText: 'The bureaucrats nod. The woman is escorted out, still hungry.',
      },
    ],
  },
  {
    id: 'origin_03_war_council',
    type: 'origin',
    title: 'The War Council',
    text: 'Your generals present a grim map. Raiders threaten the eastern border. Your predecessor left the army in shambles.',
    agency: 'military',
    options: [
      {
        direction: 'left',
        label: 'Conscript farmers to bolster defenses',
        effects: { military: 8, populace: -5, treasury: -3 },
        resultText: 'The fields lie fallow, but the border holds — for now.',
      },
      {
        direction: 'right',
        label: 'Send diplomats with gold',
        effects: { treasury: -5, stability: 5, military: -2 },
        resultText: 'The raiders accept your tribute. Your generals call it cowardice.',
      },
    ],
  },
  {
    id: 'origin_04_treasury_audit',
    type: 'origin',
    title: 'The Audit',
    text: 'The treasury records are a disaster. Your predecessor spent lavishly. The new finance minister lays out two paths forward.',
    agency: 'commerce',
    options: [
      {
        direction: 'left',
        label: 'Raise taxes on the merchant guilds',
        effects: { treasury: 8, populace: -4, stability: -2 },
        resultText: 'Gold flows in. The merchants remember this slight.',
      },
      {
        direction: 'right',
        label: 'Auction off crown properties',
        effects: { treasury: 6, authority: -4, populace: 2 },
        resultText: 'The royal estates change hands. You look diminished, but solvent.',
      },
    ],
  },
  {
    id: 'origin_05_temple_blessing',
    type: 'origin',
    title: 'The Temple Blessing',
    text: 'The High Priestess awaits at the Eternal Flame. Tradition demands the new ruler receive divine blessing. But the ceremony requires a public vow.',
    agency: 'faith',
    options: [
      {
        direction: 'left',
        label: 'Kneel and take the sacred vow',
        effects: { stability: 6, populace: 4, authority: -3 },
        resultText: 'The faithful rejoice. You have bound yourself to their expectations.',
      },
      {
        direction: 'right',
        label: 'Attend but decline the vow',
        effects: { authority: 5, stability: -3, populace: -2 },
        resultText: 'A gasp ripples through the temple. You answer to no god but yourself.',
      },
    ],
  },
  {
    id: 'origin_06_spy_report',
    type: 'origin',
    title: 'The Shadow Report',
    text: 'A hooded figure slips into your chambers at midnight. They claim to be the former spymaster, offering a dossier of secrets about every noble at court.',
    agency: 'espionage',
    options: [
      {
        direction: 'left',
        label: 'Accept the dossier',
        effects: { authority: 5, stability: 3, populace: -2 },
        resultText: 'Knowledge is power. The nobles don\'t know you know. Yet.',
      },
      {
        direction: 'right',
        label: 'Refuse and have them arrested',
        effects: { authority: 3, populace: 3, stability: -3 },
        resultText: 'The spy vanishes before the guards arrive. You sleep uneasily.',
      },
    ],
  },
  {
    id: 'origin_07_feast',
    type: 'origin',
    title: 'The Coronation Feast',
    text: 'A grand feast is expected. The kitchens can prepare a legendary banquet — but the treasury is already strained.',
    agency: 'culture',
    options: [
      {
        direction: 'left',
        label: 'Spare no expense',
        effects: { populace: 6, treasury: -8, stability: 3 },
        resultText: 'The feast is magnificent. Stories of your generosity spread far and wide.',
      },
      {
        direction: 'right',
        label: 'A modest celebration',
        effects: { treasury: 3, populace: -3, authority: 2 },
        resultText: 'The court is disappointed, but your fiscal restraint impresses the bankers.',
      },
    ],
  },
  {
    id: 'origin_08_first_night',
    type: 'origin',
    title: 'The First Night',
    text: 'Alone at last in the royal chambers. The crown sits on the bedside table, catching candlelight. Tomorrow, the real work begins. What occupies your thoughts?',
    agency: 'decree',
    options: [
      {
        direction: 'left',
        label: 'The faces of those who opposed your rise',
        effects: { authority: 5, military: 3, populace: -3 },
        resultText: 'You will remember every slight. Every enemy. Sleep comes fitfully.',
      },
      {
        direction: 'right',
        label: 'The hopes of those who celebrated',
        effects: { populace: 5, stability: 3, authority: -2 },
        resultText: 'You fall asleep dreaming of a better kingdom. Idealism is a luxury rulers rarely keep.',
      },
    ],
  },
];

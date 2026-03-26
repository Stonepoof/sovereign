// ─── Follow-Up Cards ──────────────────────────────────────────────────────
// 5 cards that trigger as consequences of earlier choices.

import { Card } from '../../types/cards';

export const FOLLOWUP_CARDS: Card[] = [
  {
    id: 'followup_01_tax_revolt',
    type: 'followup',
    title: 'Tax Revolt',
    text: 'The villages you forced to pay taxes have banded together. They refuse all tribute and have erected barricades on the trade roads.',
    agency: 'commerce',
    weight: 1,
    condition: (ctx) => ctx.meters.populace < 35 && ctx.meters.treasury > 55,
    options: [
      {
        direction: 'left',
        label: 'Negotiate reduced rates',
        effects: { treasury: -4, populace: 5, stability: 2 },
        resultText: 'Compromise is reached. The roads reopen.',
      },
      {
        direction: 'right',
        label: 'Break the barricades by force',
        effects: { military: -2, authority: 4, populace: -6 },
        resultText: 'The barricades fall. The hatred deepens.',
      },
    ],
  },
  {
    id: 'followup_02_grateful_village',
    type: 'followup',
    title: 'A Gift from the People',
    text: 'The village you saved sends a delegation bearing their finest harvest — and a hand-carved crown of wildflowers. A simple gift, but the court is moved.',
    agency: 'culture',
    weight: 1,
    condition: (ctx) => ctx.meters.populace > 65,
    options: [
      {
        direction: 'left',
        label: 'Accept with genuine warmth',
        effects: { populace: 4, authority: 2, stability: 2 },
        resultText: 'You wear the flower crown all day. The court has never seen you smile like that.',
      },
      {
        direction: 'right',
        label: 'Accept formally and send return gifts',
        effects: { populace: 2, treasury: -2, stability: 2 },
        resultText: 'A proper exchange. The diplomats approve.',
      },
    ],
  },
  {
    id: 'followup_03_generals_demand',
    type: 'followup',
    title: 'The Generals\' Demand',
    text: 'The military commanders present a unified front: they demand more funding, better equipment, and a campaign against the border raiders. Refusal could be dangerous.',
    agency: 'military',
    weight: 1,
    condition: (ctx) => ctx.meters.military > 60 && ctx.meters.authority < 45,
    options: [
      {
        direction: 'left',
        label: 'Grant their demands',
        effects: { military: 5, treasury: -8, authority: -3 },
        resultText: 'The army grows stronger. So does their influence over your throne.',
      },
      {
        direction: 'right',
        label: 'Refuse and remind them who rules',
        effects: { authority: 6, military: -5, stability: -3 },
        resultText: 'The generals salute and withdraw. Their eyes say more than their mouths.',
      },
    ],
  },
  {
    id: 'followup_04_merchant_alliance',
    type: 'followup',
    title: 'The Merchant Proposal',
    text: 'The merchant guilds offer to fund your next major project — in exchange for reduced tariffs and a seat on the royal council.',
    agency: 'commerce',
    weight: 1,
    condition: (ctx) => ctx.meters.treasury < 35,
    options: [
      {
        direction: 'left',
        label: 'Accept their offer',
        effects: { treasury: 8, authority: -5, populace: -2 },
        resultText: 'Gold flows in. The merchants now sit at your table.',
      },
      {
        direction: 'right',
        label: 'Decline and maintain crown independence',
        effects: { authority: 4, treasury: -2, stability: 2 },
        resultText: 'The merchants shrug and find other investments.',
      },
    ],
  },
  {
    id: 'followup_05_spy_network',
    type: 'followup',
    title: 'The Web Grows',
    text: 'Your intelligence network brings a troubling report: three of your own advisors are secretly corresponding with Duke Theron. The evidence is damning.',
    agency: 'espionage',
    weight: 1,
    minTurn: 10,
    maxPlays: 1,
    options: [
      {
        direction: 'left',
        label: 'Dismiss the traitors publicly',
        effects: { authority: 6, stability: -4, populace: 2 },
        resultText: 'The court watches three advisors escorted out in chains. The message is clear.',
      },
      {
        direction: 'right',
        label: 'Feed them false information',
        effects: { authority: 3, stability: 3, treasury: -2 },
        resultText: 'The traitors become unwitting double agents. Elegant.',
      },
    ],
  },
];

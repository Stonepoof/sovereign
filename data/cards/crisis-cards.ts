/**
 * Sovereign — Crisis Cards
 *
 * High-stakes cards triggered by extreme meter or district conditions.
 * Usually 2 options only. Agency: 'crisis'. Uses 2-phase rendering
 * (narration then reaction).
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY — crisis agency type, 2-phase rendering
 */

import type { Card } from '../../types';

// ---------------------------------------------------------------------------
// Crisis Cards
// ---------------------------------------------------------------------------

export const CRISIS_CARDS: Card[] = [
  {
    id: 'cr_famine',
    agency: 'crisis',
    title: 'Famine',
    portrait: '🌾',
    worldEvent: true,
    narration:
      'The granaries are empty. Three weeks of rain destroyed the harvest. ' +
      'The Market District rations bread. The Slums have nothing to ration. ' +
      'People are eating their seed grain.',
    text: 'Famine grips the kingdom. Every decision you make feeds some and starves others.',
    autoMeters: { populace: -8, stability: -5, treasury: -3 },
    once: true,
    condition: (ctx) => ctx.meters.treasury < 30 || ctx.meters.populace < 30,
    left: {
      direction: 'left',
      label: 'Open the treasury',
      sub: 'Buy grain from abroad at any price.',
      meters: { treasury: -10, populace: 8, stability: 3 },
      narr: 'Gold flows out. Grain flows in. The people eat. The treasury is dangerously thin, but the kingdom survives another month.',
    },
    right: {
      direction: 'right',
      label: 'Enforce strict rationing',
      sub: 'Equal portions for all. No exceptions.',
      meters: { stability: 5, populace: -5, authority: 3 },
      narr: 'Soldiers distribute grain by the spoonful. The rich complain. The poor receive their fair share for the first time. Hunger remains, but so does order.',
      districtFx: { id: 'slums', unrest: -5 },
    },
  },

  {
    id: 'cr_assassination_plot',
    agency: 'crisis',
    title: 'The Conspiracy',
    portrait: '🕵️',
    worldEvent: true,
    narration:
      'The Spymaster arrives at midnight. Three names on a list. Three of your own court ' +
      'members planning your removal. The evidence is thin but the threat is real.',
    text: 'A conspiracy within your court. Act too early and you become the tyrant they claim you are. Act too late and you may not act at all.',
    autoMeters: { authority: -5, stability: -5 },
    once: true,
    condition: (ctx) => ctx.meters.authority < 35 || ctx.meters.authority > 75,
    left: {
      direction: 'left',
      label: 'Arrest them now',
      sub: 'Better safe than sorry.',
      meters: { authority: 8, populace: -5, stability: -3 },
      narr: 'The arrests are swift and public. One conspirator confesses. Two maintain innocence. The court is terrified. That may have been the point.',
    },
    right: {
      direction: 'right',
      label: 'Watch and wait',
      sub: 'Let them reveal their full network.',
      meters: { authority: -3, stability: 3 },
      dice: {
        die: 'd12',
        modifier: 2,
        successMeters: { authority: 8, stability: 5 },
        failMeters: { authority: -8, stability: -5 },
        successText: 'Patience pays off. The full conspiracy is revealed — and it goes deeper than anyone imagined. You dismantle it completely.',
        failText: 'You waited too long. The conspirators act first. You survive, but only because the Spymaster intervened. Your authority is shattered.',
      },
    },
  },

  {
    id: 'cr_military_ultimatum',
    agency: 'crisis',
    title: 'The Ultimatum',
    portrait: '🛡️',
    worldEvent: true,
    narration:
      'General Kira — or the highest-ranking officer — arrives with a document. ' +
      'Not a request. A list of demands. Behind her, soldiers line the corridor.',
    text: 'The military demands increased funding and a seat on the Privy Council. The implication is clear: refuse at your peril.',
    autoMeters: { authority: -5, stability: -8 },
    once: true,
    condition: (ctx) => ctx.meters.military > 70 || ctx.meters.military < 25,
    left: {
      direction: 'left',
      label: 'Accept the demands',
      sub: 'Survival over pride.',
      meters: { military: 8, authority: -8, treasury: -5 },
      narr: 'You sign the document. The generals nod with satisfaction. You have purchased peace with a piece of your sovereignty. For how long?',
    },
    right: {
      direction: 'right',
      label: 'Refuse publicly',
      sub: '"The crown does not negotiate under threat."',
      meters: { authority: 8, military: -10, stability: -5 },
      narr: 'You tear the document in half. The silence is absolute. Kira salutes — respect or mockery, you cannot tell — and leaves. The army is watching.',
    },
  },

  {
    id: 'cr_plague_crisis',
    agency: 'crisis',
    title: 'The Dying City',
    portrait: '☠️',
    worldEvent: true,
    narration:
      'The plague has breached quarantine. Cases appear in the Market District, ' +
      'then the Capital itself. Physicians are overwhelmed. The dead pile up faster ' +
      'than they can be buried.',
    text: 'The plague spreads across districts. Half measures are no longer possible.',
    autoMeters: { populace: -10, stability: -8, treasury: -5 },
    once: true,
    condition: (ctx) => ctx.memory.flags.has('quarantined_plague') && ctx.week > 10,
    left: {
      direction: 'left',
      label: 'Total lockdown',
      sub: 'Seal every district. No movement.',
      meters: { stability: 5, populace: -8, treasury: -8 },
      narr: 'The kingdom grinds to a halt. Soldiers enforce house arrest. The plague slows. The economy collapses. People starve behind locked doors.',
      districtFx: { id: 'market', prosperity: -15 },
    },
    right: {
      direction: 'right',
      label: 'Sacrifice the Slums',
      sub: 'Quarantine only the worst areas.',
      meters: { authority: -5, populace: -5, treasury: -3 },
      narr: 'The Slums are sealed. The rest of the kingdom breathes easier. Behind the barricades, the Slums die in darkness. History will judge you.',
      corrupt: 5,
      districtFx: { id: 'slums', unrest: 25, prosperity: -15 },
    },
  },

  {
    id: 'cr_treasury_collapse',
    agency: 'crisis',
    title: 'Empty Coffers',
    portrait: '💸',
    worldEvent: true,
    narration:
      'The treasury minister does not speak. He simply opens the vault doors. ' +
      'You see stone floor where gold should be. The kingdom is broke.',
    text: 'The treasury is empty. Soldiers need paying, debts need servicing, and the people need feeding. Something must give.',
    autoMeters: { treasury: -8, stability: -5 },
    once: true,
    condition: (ctx) => ctx.meters.treasury < 20,
    left: {
      direction: 'left',
      label: 'Emergency tax levy',
      sub: 'Tax everything that moves.',
      meters: { treasury: 10, populace: -10, stability: -3 },
      narr: 'The tax collectors fan out. The people pay with coins and curses. The treasury fills. The streets empty.',
      districtFx: { id: 'slums', unrest: 15 },
    },
    right: {
      direction: 'right',
      label: 'Seize noble assets',
      sub: 'The rich can afford it.',
      meters: { treasury: 8, authority: -8, populace: 3 },
      narr: 'Lord Aldric and his peers are stripped of excess wealth. The people cheer. The nobility plots. You have made powerful enemies.',
      npcEffect: { name: 'Lord Aldric', delta: -20 },
    },
  },

  {
    id: 'cr_foreign_invasion',
    agency: 'crisis',
    title: 'Invasion',
    portrait: '⚔️',
    worldEvent: true,
    narration:
      'Riders cross the border in force. Not raiders — a standing army, with siege engines ' +
      'and cavalry. A neighboring kingdom has decided your weakness is their opportunity.',
    text: 'A foreign army marches on the kingdom. This is not a raid. This is conquest.',
    autoMeters: { military: -10, stability: -10, populace: -5 },
    once: true,
    condition: (ctx) => ctx.meters.military < 25 && ctx.week > 20,
    left: {
      direction: 'left',
      label: 'Total war',
      sub: 'Arm every citizen. Fight to the last.',
      meters: { military: 10, treasury: -10, populace: -5 },
      dice: {
        die: 'd20',
        modifier: 2,
        successMeters: { authority: 10, military: 10, stability: 5 },
        failMeters: { military: -15, populace: -10 },
        successText: 'Against all odds, the citizen army holds. The invaders retreat. The cost is immense. The victory is legendary.',
        failText: 'The citizen army breaks. Villages fall. The invaders push deeper. You hold the capital, but for how long?',
      },
    },
    right: {
      direction: 'right',
      label: 'Negotiate surrender terms',
      sub: 'Save what can be saved.',
      meters: { authority: -10, stability: 5, populace: 3 },
      narr: 'You negotiate from weakness. The terms are harsh but survivable. Your kingdom becomes a vassal. Your people live. Your pride does not.',
    },
  },
];

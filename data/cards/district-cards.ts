/**
 * Sovereign — District Cards
 *
 * Cards generated when district unrest exceeds thresholds.
 * One per district, triggered by the card selector checking districtReq.
 * Agency: 'district' — geographic, specific to district theme.
 *
 * @see SOV_PRD_04_TERRITORY section 6 — district-generated cards, injection logic
 */

import type { Card } from '../../types';

// ---------------------------------------------------------------------------
// District Cards
// ---------------------------------------------------------------------------

export const DISTRICT_CARDS: Card[] = [
  // ── Docks: Smuggling Ring ──────────────────────────────────────────────
  {
    id: 'd_docks_smuggle',
    agency: 'district',
    title: 'Smuggling Ring',
    portrait: '⚓',
    districtReq: { id: 'docks', unrestMin: 30 },
    text:
      'The harbor master reports a smuggling operation moving weapons through the Docks. ' +
      'The smugglers have connections to foreign agents. The Docks are already restless.',
    once: true,
    left: {
      direction: 'left',
      label: 'Raid the warehouses',
      sub: 'Send soldiers to seize the weapons.',
      meters: { military: 3, authority: 3, populace: -2 },
      narr: 'The raid is violent but effective. Crates of weapons are confiscated. Several dock workers are arrested. The smugglers vanish.',
      districtFx: { id: 'docks', unrest: -10, prosperity: -5 },
    },
    right: {
      direction: 'right',
      label: 'Investigate quietly',
      sub: 'Follow the supply chain upward.',
      meters: { authority: 2, treasury: -2 },
      narr: 'Your agents trace the weapons to a noble family. The investigation continues. The weapons still flow.',
      setFlags: ['docks_investigation'],
    },
    up: {
      direction: 'up',
      label: 'Tax the smugglers',
      sub: 'If you cannot stop them, profit from them.',
      meters: { treasury: 5, stability: -3 },
      corrupt: 5,
      narr: 'The smugglers pay a premium for your blind eye. Gold fills the coffers. Your integrity drains.',
    },
    down: {
      direction: 'down',
      label: 'Ignore it',
      sub: 'The Docks have always been lawless.',
      meters: { stability: -3, populace: -2 },
      narr: 'The smuggling continues unchecked. The Docks grow more dangerous. Foreign agents move freely.',
      districtFx: { id: 'docks', unrest: 8 },
    },
  },

  // ── Slums: Uprising ────────────────────────────────────────────────────
  {
    id: 'd_slums_riot',
    agency: 'district',
    title: 'Slums Uprising',
    portrait: '🏚️',
    districtReq: { id: 'slums', unrestMin: 50 },
    text:
      'The Slums have erupted. Barricades block every street. A figure called "The Champion" ' +
      'stands atop the tallest barricade, rallying the crowd. They demand food, jobs, dignity.',
    once: true,
    left: {
      direction: 'left',
      label: 'Send the guards',
      sub: 'Crush the uprising by force.',
      meters: { authority: 5, populace: -8, military: 3 },
      narr: 'The guards march into the Slums. The barricades fall. The Champion vanishes. Order is restored. But the ashes still smolder.',
      districtFx: { id: 'slums', unrest: -15, prosperity: -5 },
    },
    right: {
      direction: 'right',
      label: 'Address their grievances',
      sub: 'Go to the Slums personally.',
      meters: { populace: 8, treasury: -5, authority: -2 },
      narr: 'You walk into the Slums alone. The crowd parts. You listen. You promise. The barricades come down. Now you must deliver.',
      districtFx: { id: 'slums', unrest: -20, prosperity: 5 },
    },
    up: {
      direction: 'up',
      label: 'Recruit the Champion',
      sub: '"Join my court. Change things from within."',
      meters: { populace: 5, authority: -3 },
      npcRecruit: {
        name: 'The Champion',
        role: 'Agitator',
        faction: 'populist',
        loyalty: 40,
      },
      narr: 'The Champion hesitates. Then climbs down from the barricade. "We will see if your throne room is any different from these streets."',
      districtFx: { id: 'slums', unrest: -10 },
    },
    down: {
      direction: 'down',
      label: 'Seal the district',
      sub: 'Contain the riot. Let it burn out.',
      meters: { stability: -5, populace: -5 },
      narr: 'The Slums are sealed. The riot rages for three days. When it ends, the district is quieter. And emptier.',
      districtFx: { id: 'slums', unrest: -5, prosperity: -10 },
    },
  },

  // ── Temple: Schism ─────────────────────────────────────────────────────
  {
    id: 'd_temple_schism',
    agency: 'district',
    title: 'Temple Schism',
    portrait: '⛪',
    districtReq: { id: 'temple', unrestMin: 25 },
    text:
      'The Temple Quarter is split. Traditionalists demand adherence to ancient rites. ' +
      'Reformers want to modernize the faith. Both sides hold processions that end in fistfights.',
    once: true,
    left: {
      direction: 'left',
      label: 'Back the traditionalists',
      sub: 'The old ways have value.',
      meters: { stability: 3, populace: -3, authority: 2 },
      narr: 'You attend the traditional mass. The reformers are outraged. But the Temple Quarter calms — for now.',
      districtFx: { id: 'temple', unrest: -10, prosperity: 3 },
    },
    right: {
      direction: 'right',
      label: 'Support the reformers',
      sub: 'Progress requires change.',
      meters: { populace: 3, stability: -2, authority: -1 },
      narr: 'You endorse the reforms. The younger generation cheers. The elders pray for your soul. The Temple transforms.',
      districtFx: { id: 'temple', unrest: -5, prosperity: 5 },
    },
    up: {
      direction: 'up',
      label: 'Declare neutrality',
      sub: '"The crown does not meddle in faith."',
      meters: { stability: 2, authority: -2 },
      narr: 'Both sides are disappointed by your neutrality. The schism continues, but at a lower temperature. Time may heal, or deepen, the rift.',
      districtFx: { id: 'temple', unrest: -3 },
    },
    down: {
      direction: 'down',
      label: 'Suppress both factions',
      sub: 'No religious processions. Period.',
      meters: { authority: 5, populace: -5, stability: -3 },
      narr: 'Soldiers break up the processions. Both factions unite in hatred — of you. The Temple Quarter seethes with suppressed fury.',
      districtFx: { id: 'temple', unrest: 5 },
    },
  },

  // ── Market: Trade War ──────────────────────────────────────────────────
  {
    id: 'd_market_trade_war',
    agency: 'district',
    title: 'Trade War',
    portrait: '🏪',
    districtReq: { id: 'market', unrestMin: 35 },
    text:
      'Two merchant guilds are locked in open conflict. Price wars, sabotage, and hired ' +
      'thugs. The Market District bleeds profit as traders flee to safer harbors.',
    once: true,
    left: {
      direction: 'left',
      label: 'Favor the larger guild',
      sub: 'Back the stronger horse.',
      meters: { treasury: 5, populace: -3, stability: -2 },
      narr: 'The smaller guild is crushed. Monopoly prices follow. The Market is profitable but less free.',
      districtFx: { id: 'market', unrest: -5, prosperity: 5 },
    },
    right: {
      direction: 'right',
      label: 'Anti-trust decree',
      sub: 'Break up the monopoly.',
      meters: { populace: 3, treasury: -3, stability: 2 },
      narr: 'The decree forces both guilds to compete fairly. It takes months to enforce. But the Market breathes again.',
      districtFx: { id: 'market', unrest: -10, prosperity: 3 },
    },
    up: {
      direction: 'up',
      label: 'Create a royal guild',
      sub: 'Nationalize key trade routes.',
      meters: { authority: 5, treasury: 3, populace: -5 },
      corrupt: 3,
      narr: 'The crown takes control of major trade routes. Profits flow to the treasury. The merchants call you a tyrant. The people call it theft.',
      districtFx: { id: 'market', unrest: 5, prosperity: -3 },
    },
    down: {
      direction: 'down',
      label: 'Let them fight',
      sub: 'Competition breeds innovation.',
      meters: { stability: -4, populace: -2 },
      narr: 'The guild war escalates. A warehouse burns. Two merchants are found dead. The Market District descends into chaos.',
      districtFx: { id: 'market', unrest: 10, prosperity: -8 },
    },
  },

  // ── Capital: Coup Whispers ─────────────────────────────────────────────
  {
    id: 'd_capital_coup',
    agency: 'district',
    title: 'Whispers in the Capital',
    portrait: '👑',
    districtReq: { id: 'capital', unrestMin: 30 },
    text:
      'The Capital hums with dangerous whispers. Servants gossip about meetings in dark ' +
      'rooms. The palace guard reports unusual movement among the nobility. Something is brewing.',
    once: true,
    left: {
      direction: 'left',
      label: 'Increase palace security',
      sub: 'Double the guard. Trust no one.',
      meters: { authority: 3, military: -2, treasury: -3 },
      narr: 'The palace becomes a fortress. Every shadow is watched. The nobility complains about the atmosphere of suspicion. Good. Let them be watched.',
      districtFx: { id: 'capital', unrest: -5 },
    },
    right: {
      direction: 'right',
      label: 'Host a grand ball',
      sub: 'Keep your enemies close.',
      meters: { treasury: -5, populace: 2, stability: 2 },
      narr: 'Wine and music. Smiles and daggers. You work the room, charming and observing. By dawn, you know who whispers and who listens.',
      districtFx: { id: 'capital', unrest: -8 },
    },
    up: {
      direction: 'up',
      label: 'Address the court directly',
      sub: '"I know what you are planning."',
      meters: { authority: 5, stability: -3 },
      narr: 'Silence fills the throne room. Some faces go pale. You name no names, but the guilty know. The whispers stop. For now.',
      districtFx: { id: 'capital', unrest: -10 },
    },
    down: {
      direction: 'down',
      label: 'Leave the Capital',
      sub: 'A royal tour of the provinces.',
      meters: { authority: -3, populace: 3, stability: -2 },
      narr: 'You leave the nest of vipers and visit the people. The provinces love you. The Capital schemes in your absence.',
      districtFx: { id: 'capital', unrest: 5 },
    },
  },
];

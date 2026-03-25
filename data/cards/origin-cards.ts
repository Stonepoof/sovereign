/**
 * Sovereign — Origin Cards (8-card onboarding sequence)
 *
 * The onboarding IS the gameplay. No tutorials. No popups. Character creation
 * happens through diegetic flashbacks interleaved with present-tense decisions.
 * Meters, tabs, and systems are revealed progressively across 8 cards.
 *
 * Pattern: REAL -> FLASH -> REAL -> FLASH -> WORLD -> REACTION -> ALLIANCE -> FINALE
 *
 * @see SOV_PRD_08_ONBOARDING — card-by-card specification, progressive disclosure
 */

import type { Card } from '../../types';

// ---------------------------------------------------------------------------
// Origin Cards
// ---------------------------------------------------------------------------

export const ORIGIN_CARDS: Card[] = [
  // ── Card 1: The First Petition ──────────────────────────────────────────
  {
    id: 'origin_01_petition',
    agency: 'petition',
    title: 'The First Petition',
    portrait: '📋',
    art: '📋',
    text:
      'Your first morning as Sovereign. Before the tea cools, a messenger bursts in. ' +
      'A dispute between two lords over water rights. Both threaten violence.',
    left: {
      direction: 'left',
      label: 'Side with Lord Marsh',
      sub: 'He controls the river source.',
      meters: { authority: 3, populace: -2 },
    },
    right: {
      direction: 'right',
      label: 'Side with Lord Vale',
      sub: 'He feeds three villages.',
      meters: { populace: 3, treasury: -2 },
    },
    up: {
      direction: 'up',
      label: 'Split the river',
      sub: 'An engineering compromise.',
      meters: { stability: 3, treasury: -3 },
    },
    down: {
      direction: 'down',
      label: 'Postpone the decision',
      sub: '"I need time to think."',
      meters: { stability: -2 },
    },
    // No meters visible yet — this card teaches the swipe mechanic
  },

  // ── Card 2: A Memory Surfaces ───────────────────────────────────────────
  {
    id: 'origin_02_memory',
    agency: 'personal',
    title: 'A Memory Surfaces',
    portrait: '🧒',
    art: '🧒',
    text:
      "As you weigh the lords' claims, a memory surfaces. You're seven. A tax collector " +
      'backhands a woman in the square. Her apples scatter. Your fists clench.',
    reveal: 'firstMeter',
    left: {
      direction: 'left',
      label: 'Watch in silence',
      sub: 'Power takes; you learned early.',
      meters: {},
    },
    right: {
      direction: 'right',
      label: 'Throw a stone',
      sub: 'It hit. You ran.',
      meters: { populace: 2, authority: -1 },
    },
    up: {
      direction: 'up',
      label: 'Help her up',
      sub: 'She pressed an apple into your hand.',
      meters: { populace: 2 },
    },
    down: {
      direction: 'down',
      label: 'Run home',
      sub: 'Not your fight. Shame followed for years.',
      meters: {},
    },
  },

  // ── Card 3: The Budget Crisis ───────────────────────────────────────────
  {
    id: 'origin_03_budget',
    agency: 'action',
    title: 'The Budget Crisis',
    portrait: '💰',
    art: '💰',
    text:
      'Your treasury minister arrives with grim numbers. The previous Sovereign spent ' +
      'lavishly. Enough gold for two months. Choose where to cut.',
    reveal: 'meterReveal',
    left: {
      direction: 'left',
      label: 'Cut military spending',
      sub: 'The generals will object.',
      meters: { treasury: 5, military: -5 },
      revealMeter: 'treasury',
    },
    right: {
      direction: 'right',
      label: 'Raise merchant taxes',
      sub: 'The markets will suffer.',
      meters: { treasury: 5, populace: -3 },
      revealMeter: 'populace',
    },
    up: {
      direction: 'up',
      label: 'Sell crown lands',
      sub: 'Permanent loss, immediate gold.',
      meters: { treasury: 8, authority: -4 },
    },
    down: {
      direction: 'down',
      label: 'Borrow from abroad',
      sub: 'Foreign leverage.',
      meters: { treasury: 5, stability: -3 },
    },
  },

  // ── Card 4: How You Got Here ────────────────────────────────────────────
  {
    id: 'origin_04_apprenticeship',
    agency: 'personal',
    title: 'How You Got Here',
    portrait: '📖',
    art: '📖',
    text:
      "Between meetings, you stare at your predecessor's portrait. You remember the day " +
      'everything changed — the letter at fourteen, offering to shape you.',
    reveal: 'allMeters',
    left: {
      direction: 'left',
      label: 'Master Brynn (Law)',
      sub: '"The law is the skeleton of civilization."',
      meters: { authority: 5, stability: 2 },
    },
    right: {
      direction: 'right',
      label: 'Commander Ashka (Military)',
      sub: '"Complain and you train longer."',
      meters: { military: 5, authority: 2 },
    },
    up: {
      direction: 'up',
      label: 'Father Aldous (Faith)',
      sub: '"I see fire in you. Let me teach you."',
      meters: { populace: 5, stability: 2 },
    },
    down: {
      direction: 'down',
      label: 'Merchant Isha (Trade)',
      sub: '"Everything has a price. First lesson free."',
      meters: { treasury: 5, stability: 2 },
    },
  },

  // ── Card 5: Night of Three Fires (World Event) ─────────────────────────
  {
    id: 'origin_05_fires',
    agency: 'world',
    title: 'Night of Three Fires',
    portrait: '🔥',
    art: '🔥',
    worldEvent: true,
    narration:
      "You're woken by screaming. Three pillars of fire — granary, temple, magistrate's " +
      'court. Burning simultaneously. Not an accident. A face vanishes into smoke.',
    text:
      'The fires die by morning. Three critical buildings destroyed in one night. ' +
      'The city is in shock. Someone planned this.',
    autoMeters: { stability: -8, populace: -5, military: 3, authority: -3 },
    // No swipe options on the narration card itself — card 6 is the reaction
  },

  // ── Card 6: What the Fire Revealed (Trait Selection) ───────────────────
  {
    id: 'origin_06_trait',
    agency: 'action',
    title: 'What the Fire Revealed',
    portrait: '😤',
    art: '😤',
    text:
      "The fires die by morning but their heat stays in your chest. The question isn't " +
      "what happened. It's what you'll become because of it.",
    reveal: 'trait',
    left: {
      direction: 'left',
      label: 'Hunt the guilty',
      sub: 'Someone ordered this. They will answer.',
      meters: { authority: 5, stability: -2 },
      trait: 'vendetta',
    },
    right: {
      direction: 'right',
      label: 'Rebuild and unite',
      sub: 'Hope is harder than anger.',
      meters: { populace: 5, stability: 3 },
      trait: 'reformer',
    },
    up: {
      direction: 'up',
      label: 'Seize the moment',
      sub: 'The old order burned. Why not you?',
      meters: { authority: 8, populace: -3 },
      trait: 'ambitious',
    },
    down: {
      direction: 'down',
      label: 'Protect the innocent',
      sub: "Children, old, those who can't run.",
      meters: { populace: 5, military: 3 },
      trait: 'guardian',
    },
  },

  // ── Card 7: The Faction (Court Unlock) ─────────────────────────────────
  {
    id: 'origin_07_faction',
    agency: 'action',
    title: 'The Faction',
    portrait: '🏴',
    art: '🏴',
    text:
      "Three messengers find you. Each carries a flag. Each says 'We need someone like you.' " +
      "What they don't say is what they'll need you to become.",
    reveal: 'court',
    left: {
      direction: 'left',
      label: 'Reform Coalition',
      sub: 'Change through legislation.',
      meters: { populace: 3, stability: 2 },
      npcRecruit: {
        name: 'Senator Voss',
        role: 'Faction Leader',
        faction: 'reform',
        loyalty: 50,
      },
    },
    right: {
      direction: 'right',
      label: 'Loyalist Guard',
      sub: 'Strength through order.',
      meters: { authority: 3, military: 2 },
      npcRecruit: {
        name: 'General Kira',
        role: 'Commander',
        faction: 'military',
        loyalty: 50,
      },
    },
    up: {
      direction: 'up',
      label: "People's Front",
      sub: 'Power to the people.',
      meters: { populace: 5 },
      npcRecruit: {
        name: 'Sister Maren',
        role: 'Populist',
        faction: 'populist',
        loyalty: 50,
      },
    },
    down: {
      direction: 'down',
      label: 'Go independent',
      sub: 'You answer to no faction.',
      meters: { stability: 3 },
      // No NPC recruited
    },
  },

  // ── Card 8: Week One (Game Begins) ─────────────────────────────────────
  {
    id: 'origin_08_begin',
    agency: 'personal',
    title: 'Week One',
    portrait: '🏛️',
    art: '🏛️',
    text: (ctx) => {
      const ally =
        ctx.npcs.length > 0 ? ctx.npcs[ctx.npcs.length - 1].name : 'No one';
      return (
        `You step into the council chamber. Faces turn. ${ally} nods from ` +
        'across the room. 48 weeks until the next election. Make them count.'
      );
    },
    reveal: 'fullUI',
    final: true,
    right: {
      direction: 'right',
      label: 'Take your seat',
      sub: 'The kingdom awaits.',
      meters: {},
    },
  },
];

/**
 * Sovereign — Follow-up Cards
 *
 * Consequence cards triggered by flags set in earlier decisions.
 * Highest priority in the card selector (priority 1).
 * These create the feeling that choices matter across weeks.
 *
 * @see SOV_PRD_07_NARRATIVE_ENGINE section 5 — consequence chains
 */

import type { Card } from '../../types';

// ---------------------------------------------------------------------------
// Follow-up Cards
// ---------------------------------------------------------------------------

export const FOLLOWUP_CARDS: Card[] = [
  // ── Chain: Water Crisis -> Mining Scandal -> Aldric's Secret ────────────
  {
    id: 'fu_scandal',
    agency: 'petition',
    title: "Lord Aldric's Secret",
    portrait: '🏛️',
    npc: 'Lord Aldric',
    priority: 1,
    once: true,
    condition: (ctx) =>
      ctx.memory.flags.has('discovered_mining_scandal') &&
      !ctx.memory.flags.has('resolved_scandal'),
    text:
      'Your investigators traced the poisoned well to mining runoff. The mine belongs to ' +
      "Lord Aldric. He stands before you now, pale but composed. 'Sovereign, I can explain.'",
    left: {
      direction: 'left',
      label: 'Use as leverage',
      sub: '"You owe me now, Aldric."',
      meters: { authority: 5, stability: -2 },
      corrupt: 5,
      narr: "Aldric understands immediately. 'I am... at your service, Sovereign.' You have gained a tool. You have lost something else.",
      setFlags: ['blackmailed_aldric', 'resolved_scandal'],
      npcEffect: { name: 'Lord Aldric', delta: -15 },
    },
    right: {
      direction: 'right',
      label: 'Public accountability',
      sub: 'Let justice be seen.',
      meters: { populace: 5, authority: 3, treasury: -3 },
      narr: "The trial is public. Aldric is stripped of the mine. The people cheer. The nobles take note: no one is above the law.",
      setFlags: ['exposed_aldric', 'resolved_scandal'],
      npcEffect: { name: 'Lord Aldric', delta: -20 },
    },
    up: {
      direction: 'up',
      label: 'Quiet fix',
      sub: 'Close the mine. Say nothing.',
      meters: { stability: 3, populace: -2 },
      narr: 'The mine is closed. The water clears. No one knows why. Aldric nods gratefully. The elder\'s village heals in silence.',
      setFlags: ['resolved_scandal'],
    },
    down: {
      direction: 'down',
      label: 'Store the information',
      sub: 'Knowledge is power. Save it.',
      meters: { authority: 2 },
      narr: "You file the evidence away. Aldric sweats in the antechamber. He doesn't know what you know. Let him wonder.",
      setFlags: ['resolved_scandal'],
    },
  },

  // ── Chain: Border Incursion -> Diplomacy Fails -> Raiders Return ────────
  {
    id: 'fu_raiders',
    agency: 'world',
    title: 'The Raiders Return',
    portrait: '⚔️',
    worldEvent: true,
    priority: 1,
    once: true,
    condition: (ctx) =>
      ctx.memory.flags.has('chose_diplomacy') &&
      !ctx.memory.flags.has('raiders_resolved'),
    narration: (ctx) =>
      ctx.memory.flags.has('funded_schools')
        ? 'Your diplomats are found dead on the road north. The raiders did not want peace — they wanted time. The army, weakened by budget cuts, braces for the second wave.'
        : 'Your diplomats return empty-handed. The raiders laughed at your gold. They want land, not coin. The second wave crosses the border at dawn.',
    text: 'Diplomacy has failed. The raiders are back in force. This time they are not testing — they are conquering.',
    autoMeters: { stability: -5, military: -3 },
    left: {
      direction: 'left',
      label: 'Full mobilization',
      sub: 'No half measures this time.',
      meters: { military: 5, treasury: -8, authority: 5 },
      narr: 'The entire army rides north. The battle is bloody but decisive. The raiders are broken. The cost in gold and lives is staggering.',
      setFlags: ['raiders_resolved'],
    },
    right: {
      direction: 'right',
      label: 'Personal command',
      sub: 'Lead the army yourself.',
      meters: { authority: 8, military: 3 },
      dice: {
        die: 'd12',
        modifier: 2,
        successMeters: { authority: 8, military: 5, populace: 3 },
        failMeters: { authority: -5, military: -5, populace: -3 },
        successText: 'You ride at the head of the column. The battle is fierce but your presence inspires. The raiders break. Legends are born.',
        failText: 'Your tactical inexperience shows. The battle is a confused mess. You survive by luck, not skill. The army loses faith.',
      },
      setFlags: ['raiders_resolved'],
    },
    up: {
      direction: 'up',
      label: 'Hire mercenaries',
      sub: 'Pay professionals to solve the problem.',
      meters: { treasury: -10, military: 2 },
      narr: 'The mercenaries are expensive but effective. The raiders are crushed. The mercenaries, however, now know your kingdom is weak and wealthy.',
      setFlags: ['raiders_resolved', 'used_mercenaries'],
    },
    down: {
      direction: 'down',
      label: 'Offer them land',
      sub: 'Give the raiders what they want.',
      meters: { authority: -8, stability: -5, populace: -5, military: 3 },
      narr: 'The raiders are granted frontier lands. They settle. Some call it wisdom. Most call it surrender. The border is quiet. Your reputation is not.',
      setFlags: ['raiders_resolved', 'settled_raiders'],
    },
  },

  // ── Follow-up: Mercenary Problem ───────────────────────────────────────
  {
    id: 'fu_mercenaries',
    agency: 'action',
    title: 'The Mercenary Problem',
    portrait: '💰',
    priority: 1,
    once: true,
    condition: (ctx) =>
      ctx.memory.flags.has('used_mercenaries') &&
      !ctx.memory.flags.has('mercenaries_resolved'),
    text:
      'The mercenaries you hired refuse to leave. They have set up camp outside the capital ' +
      'and are demanding more gold. They know your army is weak.',
    left: {
      direction: 'left',
      label: 'Pay them off',
      sub: 'Gold is cheaper than blood.',
      meters: { treasury: -8, stability: 2 },
      narr: 'The mercenaries take the gold and leave. For now. They will return when the gold runs out.',
      setFlags: ['mercenaries_resolved'],
    },
    right: {
      direction: 'right',
      label: 'Absorb into the army',
      sub: 'Offer permanent positions.',
      meters: { military: 5, treasury: -5 },
      narr: 'The mercenaries become soldiers. Their loyalty is questionable. Their skill is undeniable. The army grows.',
      setFlags: ['mercenaries_resolved'],
    },
    up: {
      direction: 'up',
      label: 'Drive them out by force',
      sub: 'Show them the kingdom is not weak.',
      meters: { authority: 5, military: -3 },
      dice: {
        die: 'd10',
        modifier: 2,
        successMeters: { authority: 5, stability: 3 },
        failMeters: { military: -5, stability: -5 },
        successText: 'The army, inspired by duty, routes the mercenaries. The message is clear: the kingdom fights its own battles.',
        failText: 'The mercenaries are better fighters than your soldiers. The skirmish is a humiliation. They demand double the gold.',
      },
      setFlags: ['mercenaries_resolved'],
    },
    down: {
      direction: 'down',
      label: 'Negotiate',
      sub: 'Find terms both sides can accept.',
      meters: { stability: 3, treasury: -3 },
      narr: 'Land for service. The mercenaries settle on the frontier. They become border guards — useful, dangerous, unpredictable.',
      setFlags: ['mercenaries_resolved'],
    },
  },

  // ── Follow-up: Settled Raiders ─────────────────────────────────────────
  {
    id: 'fu_raider_integration',
    agency: 'petition',
    title: 'The New Neighbors',
    portrait: '🏕️',
    priority: 1,
    once: true,
    condition: (ctx) =>
      ctx.memory.flags.has('settled_raiders') &&
      ctx.week > 20 &&
      !ctx.memory.flags.has('raiders_integration_resolved'),
    text:
      'The settled raiders and local villagers are clashing. Cultural differences erupt into ' +
      'brawls. A delegation of both sides arrives, each blaming the other.',
    left: {
      direction: 'left',
      label: 'Enforce integration',
      sub: 'Mixed schools, shared festivals.',
      meters: { populace: 3, stability: 3, treasury: -3 },
      narr: 'It is awkward and slow. Some children learn each other\'s languages. It will take a generation. But it begins.',
      setFlags: ['raiders_integration_resolved'],
    },
    right: {
      direction: 'right',
      label: 'Separate communities',
      sub: 'Formal borders between them.',
      meters: { stability: 2, populace: -2 },
      narr: 'The communities are split. Peace returns through distance. Integration dies. But the fighting stops.',
      setFlags: ['raiders_integration_resolved'],
    },
    up: {
      direction: 'up',
      label: 'Expel the raiders',
      sub: '"The experiment has failed."',
      meters: { authority: 3, populace: -5, stability: -3 },
      narr: 'The raiders are driven out. They leave with fury in their eyes. You have broken your word. The border will never be safe again.',
      setFlags: ['raiders_integration_resolved'],
    },
    down: {
      direction: 'down',
      label: 'Appoint a raider chief as local magistrate',
      sub: 'Let them govern themselves.',
      meters: { authority: -3, populace: 2, stability: 2 },
      narr: 'The raider chief rules fairly. The old villagers are scandalized. The young ones shrug. Power changes shape.',
      setFlags: ['raiders_integration_resolved'],
    },
  },

  // ── Follow-up: Blackmail Consequences ──────────────────────────────────
  {
    id: 'fu_aldric_revenge',
    agency: 'personal',
    title: "Aldric's Gambit",
    portrait: '🏛️',
    priority: 1,
    once: true,
    condition: (ctx) =>
      ctx.memory.flags.has('blackmailed_aldric') &&
      ctx.week > 15 &&
      !ctx.memory.flags.has('aldric_revenge_resolved'),
    text:
      'Lord Aldric has been too quiet. Too obedient. Tonight you discover why: he has been ' +
      "gathering evidence of YOUR indiscretions. A sealed letter waits on your desk. " +
      '"Sovereign. We should talk about mutual interests."',
    left: {
      direction: 'left',
      label: 'Destroy the evidence',
      sub: 'Find and burn everything.',
      meters: { authority: 3, stability: -3 },
      corrupt: 5,
      narr: 'Your agents raid his study. Letters burn. But Aldric smiles. "Did you find all of them?" You will never be sure.',
      setFlags: ['aldric_revenge_resolved'],
    },
    right: {
      direction: 'right',
      label: 'Accept mutual destruction',
      sub: '"We both have secrets. Let us keep them."',
      meters: { stability: 3 },
      corrupt: 3,
      narr: 'A cold peace. You and Aldric are bound together by mutual blackmail. Neither can move against the other. This is politics.',
      setFlags: ['aldric_revenge_resolved'],
    },
    up: {
      direction: 'up',
      label: 'Confess publicly first',
      sub: 'Take away his leverage.',
      meters: { authority: -5, populace: 5, stability: 2 },
      narr: 'You stand before the court and confess your corruption. The shock is immense. Aldric\'s weapon is useless. Your honesty is its own kind of power.',
      setFlags: ['aldric_revenge_resolved'],
    },
    down: {
      direction: 'down',
      label: 'Have Aldric arrested',
      sub: 'End this permanently.',
      meters: { authority: 5, populace: -3, stability: -3 },
      narr: 'Aldric is taken in the night. The charges are fabricated. The nobles are terrified. You have crossed a line.',
      corrupt: 8,
      setFlags: ['aldric_revenge_resolved'],
    },
  },
];

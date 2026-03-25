/**
 * Sovereign — Base Gameplay Cards
 *
 * Standard governance decisions forming the primary card pool.
 * Covers world events, petitions, personal dilemmas, and proactive actions.
 * The card selector draws from this pool at priority 5 (lowest).
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY — card types, agency definitions
 * @see SOV_PRD_07_NARRATIVE_ENGINE — text functions, flag system, card selector
 */

import type { Card } from '../../types';

// ---------------------------------------------------------------------------
// Base Cards
// ---------------------------------------------------------------------------

export const BASE_CARDS: Card[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD EVENTS (agency: 'world') — impersonal, journalistic, 2-phase
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'w_border',
    agency: 'world',
    title: 'Border Incursion',
    portrait: '⚔️',
    worldEvent: true,
    narration: (ctx) =>
      ctx.npcs.some((n) => n.name === 'General Kira')
        ? "General Kira bursts into the chamber. 'Sovereign, 500 raiders crossed the northern border at dawn. Three villages burn.'"
        : 'A breathless messenger. 500 raiders crossed the northern border at dawn. Three villages burn.',
    text: 'The border burns. 500 riders, well-armed, organized. This is not banditry — this is a test of your response.',
    autoMeters: { stability: -5, military: -3 },
    once: true,
    left: {
      direction: 'left',
      label: 'Full mobilization',
      sub: 'Send the army. All of it.',
      meters: { military: 5, treasury: -5, authority: 3 },
      narr: 'The army marches north. The raiders scatter before superior numbers. But the cost is staggering.',
      setFlags: ['mobilized_army'],
    },
    right: {
      direction: 'right',
      label: 'Diplomatic envoy',
      sub: 'Send negotiators with gold.',
      meters: { treasury: -3, stability: 3, military: -2 },
      narr: 'Your envoys ride north with white flags and heavy purses. Time will tell if gold speaks louder than steel.',
      setFlags: ['chose_diplomacy'],
    },
    up: {
      direction: 'up',
      label: 'Set a trap',
      sub: 'Lure them into an ambush.',
      meters: { military: 3, authority: 2 },
      dice: {
        die: 'd12',
        modifier: 2,
        successMeters: { military: 5, authority: 3 },
        failMeters: { military: -3, populace: -5 },
        successText: 'The trap works. The raiders are crushed in the valley. Songs will be written about this.',
        failText: 'The ambush fails. The raiders were warned. Casualties mount. The villages burn brighter.',
      },
    },
    down: {
      direction: 'down',
      label: 'Fortify and wait',
      sub: 'Strengthen defenses. Let them come.',
      meters: { stability: 2, populace: -3 },
      narr: 'The border villages are abandoned to their fate. You fortify the inner provinces. Refugees clog the roads.',
    },
  },

  {
    id: 'w_plague',
    agency: 'world',
    title: 'The Plague Ship',
    portrait: '☠️',
    worldEvent: true,
    narration:
      'A merchant vessel drifts into harbor. No crew on deck. The harbor master boards and ' +
      'finds the hold full of dead. By evening, three dockworkers are coughing blood.',
    text: 'Plague has arrived from across the sea. The Docks are the epicenter. Every hour of delay costs lives.',
    autoMeters: { populace: -5, stability: -3, treasury: -2 },
    once: true,
    left: {
      direction: 'left',
      label: 'Quarantine the Docks',
      sub: 'Seal the district. No one in or out.',
      meters: { stability: 5, populace: -5, treasury: -3 },
      narr: 'The Docks are sealed. Soldiers stand at every exit. Inside, people bang on barricaded doors. The plague slows, but the screaming does not.',
      setFlags: ['quarantined_plague'],
      districtFx: { id: 'docks', unrest: 15, prosperity: -10 },
    },
    right: {
      direction: 'right',
      label: 'Send physicians',
      sub: 'Treat the sick. Pray for the best.',
      meters: { populace: 3, treasury: -5 },
      narr: 'Physicians stream into the Docks. Many will not return. The plague spreads slower, but it spreads.',
      districtFx: { id: 'docks', unrest: 5, prosperity: -5 },
    },
    up: {
      direction: 'up',
      label: 'Burn the ship',
      sub: 'Destroy the source. Publicly.',
      meters: { authority: 3, treasury: -2, populace: -2 },
      narr: 'The plague ship burns in the harbor. The crowd watches in silence. A message: the Sovereign acts decisively. But the plague is already ashore.',
    },
    down: {
      direction: 'down',
      label: 'Pray for divine intervention',
      sub: 'Let the Temple handle it.',
      meters: { stability: -3, populace: -3 },
      narr: 'You defer to faith. The Temple Quarter organizes prayers and processions. The plague does not care.',
      districtFx: { id: 'temple', unrest: 5 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PETITIONS (agency: 'petition') — conversational, someone talks TO you
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'p_taxes',
    agency: 'petition',
    title: 'The Tax Question',
    portrait: '🏛️',
    npc: 'Lord Aldric',
    text: (ctx) =>
      ctx.memory.flags.has('shared_in_famine')
        ? "'Sovereign.' Lord Aldric bows deeper than usual. 'The lords remember your generosity during the famine. They ask — humbly — for lower taxes this season.'"
        : "'Sovereign.' Lord Aldric's voice is measured. 'The lords want lower taxes. The treasury minister wants higher. You must choose who suffers.'",
    left: {
      direction: 'left',
      label: 'Lower taxes',
      sub: 'The lords will be grateful.',
      meters: { populace: 3, treasury: -5 },
      narr: "'Wise, Sovereign. Wise.' Aldric's relief is visible. The treasury minister says nothing, but his jaw tightens.",
      setFlags: ['lowered_taxes'],
      npcEffect: { name: 'Lord Aldric', delta: 5 },
    },
    right: {
      direction: 'right',
      label: 'Raise taxes',
      sub: 'The treasury needs filling.',
      meters: { treasury: 5, populace: -3 },
      narr: "'The lords will not forget this, Sovereign.' Aldric's courtesy hardens. The treasury minister nods with satisfaction.",
      setFlags: ['raised_taxes'],
      npcEffect: { name: 'Lord Aldric', delta: -10 },
    },
    up: {
      direction: 'up',
      label: 'Tax reform',
      sub: 'New system: progressive brackets.',
      meters: { stability: 3, treasury: 2, authority: -2 },
      narr: 'A bold proposal. The rich will pay more, the poor less. Implementation will take months. Everyone is unhappy — the mark of true compromise.',
    },
    down: {
      direction: 'down',
      label: 'Defer to council',
      sub: '"Let the council decide."',
      meters: { authority: -3, stability: 2 },
      narr: "Aldric's face flickers between relief and contempt. The council will argue for weeks. Nothing will change.",
    },
  },

  {
    id: 'p_water',
    agency: 'petition',
    title: 'Desperate Plea',
    portrait: '👵',
    npc: 'Village Elder',
    text:
      "An elderly woman is escorted in. She can barely stand. 'Sovereign... the well is " +
      "poisoned. Children are... the children...' She trails off, unable to finish.",
    left: {
      direction: 'left',
      label: 'Fund a new well',
      sub: 'Commission immediate construction.',
      meters: { treasury: -5, populace: 5 },
      narr: 'The elder weeps with gratitude. Construction begins within days. Clean water flows by month end.',
      setFlags: ['funded_well'],
    },
    right: {
      direction: 'right',
      label: 'Send physicians',
      sub: 'Treat the sick, find the source.',
      meters: { treasury: -3, populace: 3 },
      narr: 'Physicians ride out immediately. They save most of the children. The source of the poison remains unknown.',
    },
    up: {
      direction: 'up',
      label: 'Investigate the source',
      sub: 'Someone poisoned it deliberately.',
      meters: { authority: 3, treasury: -2 },
      narr: 'Your investigators find traces of mining runoff. The mine belongs to... Lord Aldric. Interesting.',
      setFlags: ['discovered_mining_scandal'],
    },
    down: {
      direction: 'down',
      label: 'Redirect nearby water',
      sub: 'Divert the river. Temporary fix.',
      meters: { treasury: -2, stability: -2, populace: 2 },
      narr: 'The river is diverted. The downstream farms lose irrigation. You have traded one problem for another.',
    },
  },

  {
    id: 'p_merchants',
    agency: 'petition',
    title: 'The Merchant Guild',
    portrait: '🏪',
    npc: 'Merchant Guildmaster',
    text:
      'The Merchant Guildmaster arrives with ledgers and demands. "The trade routes are ' +
      'strangled by bandits and tariffs. Commerce is dying. We need action, Sovereign."',
    left: {
      direction: 'left',
      label: 'Fund trade escorts',
      sub: 'Military protection for merchant caravans.',
      meters: { treasury: -4, military: -2, populace: 3 },
      narr: 'Soldiers escort the caravans. Trade resumes. The military grumbles about guard duty.',
    },
    right: {
      direction: 'right',
      label: 'Lower tariffs',
      sub: 'Open the borders to trade.',
      meters: { treasury: -3, populace: 3, stability: 2 },
      narr: 'Trade flows freely again. The treasury takes a hit, but the markets are alive with foreign goods.',
    },
    up: {
      direction: 'up',
      label: 'Crack down on bandits',
      sub: 'Send a punitive expedition.',
      meters: { military: 3, authority: 3, treasury: -3 },
      narr: 'The bandits are scattered. Some were desperate farmers. The distinction does not matter to the dead.',
    },
    down: {
      direction: 'down',
      label: '"The guild must adapt"',
      sub: 'Not the crown\'s problem.',
      meters: { authority: -2, populace: -3 },
      narr: 'The Guildmaster leaves in cold fury. Within a week, several merchants relocate to neighboring kingdoms.',
      districtFx: { id: 'market', unrest: 5, prosperity: -5 },
    },
  },

  {
    id: 'p_refugees',
    agency: 'petition',
    title: 'Refugees at the Gate',
    portrait: '🚶',
    text:
      'Hundreds of refugees gather at the capital gates. Fleeing war in the south, they beg ' +
      'for shelter and bread. The crowd grows by the hour. The guards look to you.',
    left: {
      direction: 'left',
      label: 'Open the gates',
      sub: 'Welcome them all.',
      meters: { populace: 5, treasury: -5, stability: -2 },
      narr: 'The gates open. Hundreds stream in. The Slums absorb most of them. Food prices spike overnight.',
      districtFx: { id: 'slums', unrest: 10, prosperity: -5 },
    },
    right: {
      direction: 'right',
      label: 'Organized intake',
      sub: 'Process them. Housing, work assignments.',
      meters: { stability: 3, treasury: -3, populace: 2 },
      narr: 'A slow, orderly process. Some grumble at the wait, but the system works. The bureaucracy has its uses.',
    },
    up: {
      direction: 'up',
      label: 'Close the gates',
      sub: 'We cannot afford to help.',
      meters: { authority: 2, populace: -5, stability: 2 },
      narr: 'The gates slam shut. Through the walls, you hear crying. The guards will not meet your eyes.',
    },
    down: {
      direction: 'down',
      label: 'Send them south to the Docks',
      sub: 'The harbor can absorb them.',
      meters: { stability: -2, populace: -1 },
      narr: 'The refugees are redirected. The Docks, already strained, creak under new pressure.',
      districtFx: { id: 'docks', unrest: 8, prosperity: -3 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL (agency: 'personal') — interior, reflective, second person
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'ps_sleepless',
    agency: 'personal',
    title: 'Sleepless Night',
    portrait: '🌙',
    text: (ctx) => {
      const ct = ctx.memory.choices.length;
      return ct > 5
        ? `The candle gutters. ${ct} decisions press on your chest. Sleep will not come. The bed is too large for one person and too small for the weight of a kingdom.`
        : 'Your first sleepless night. The bed is too large. Every creak sounds like a footstep. The crown sits on the nightstand, catching moonlight.';
    },
    left: {
      direction: 'left',
      label: 'Read state documents',
      sub: 'If you cannot sleep, work.',
      meters: { authority: 2, stability: 1 },
      narr: 'By dawn you have read every pending petition. Your eyes burn, but you know more than your ministers expect.',
    },
    right: {
      direction: 'right',
      label: 'Walk the palace',
      sub: 'The night air might clear your head.',
      meters: { populace: 2 },
      narr: 'In the kitchens, you find the night staff. They are startled but pleased. You share bread and stories until dawn.',
    },
    up: {
      direction: 'up',
      label: 'Write in your journal',
      sub: 'Record your thoughts. For posterity.',
      meters: { stability: 2 },
      narr: 'The words flow. Doubts, fears, ambitions — all committed to paper. Someday someone will read this and understand.',
    },
    down: {
      direction: 'down',
      label: 'Drink until it stops',
      sub: 'The wine cellar is close.',
      meters: { stability: -2, authority: -1 },
      corrupt: 2,
      narr: 'The wine is excellent. The morning will be terrible. The servants pretend not to notice.',
    },
  },

  {
    id: 'ps_portrait',
    agency: 'personal',
    title: 'The Royal Portrait',
    portrait: '🎨',
    text:
      'A painter has been commissioned for the official portrait. She asks how you wish ' +
      'to be remembered. The brush hovers. The canvas waits.',
    left: {
      direction: 'left',
      label: 'Stern and powerful',
      sub: 'Armor, sword, unflinching gaze.',
      meters: { authority: 3, populace: -1 },
      narr: 'The portrait shows a warrior-sovereign. Your enemies will see it first. That is the point.',
    },
    right: {
      direction: 'right',
      label: 'Warm and approachable',
      sub: 'Simple clothes, a half-smile.',
      meters: { populace: 3, authority: -1 },
      narr: 'The portrait shows a human being. Some call it undignified. The common people love it.',
    },
    up: {
      direction: 'up',
      label: 'Surrounded by advisors',
      sub: 'You lead, but you listen.',
      meters: { stability: 2, authority: 1 },
      narr: 'The group portrait takes weeks. Each advisor jockeys for position. The result is stately and political.',
    },
    down: {
      direction: 'down',
      label: 'Refuse the portrait',
      sub: '"Paintings are for the dead."',
      meters: { authority: -2, stability: -1 },
      narr: 'The painter is dismissed. The court is scandalized. History will have no face for your reign.',
    },
  },

  {
    id: 'ps_old_friend',
    agency: 'personal',
    title: 'An Old Friend',
    portrait: '🤝',
    text:
      'A face from before your ascension. Tam, your childhood friend, waits in the ' +
      'antechamber. The years have been hard on him. His smile is the same.',
    left: {
      direction: 'left',
      label: 'Offer a position',
      sub: '"I need people I can trust."',
      meters: { stability: 2, authority: -1 },
      npcRecruit: {
        name: 'Friend Tam',
        role: 'Aide',
        loyalty: 70,
      },
      narr: "Tam's eyes widen. 'Are you sure? I'm not... I don't know this world.' But he stays. And he is loyal.",
    },
    right: {
      direction: 'right',
      label: 'Give gold and send away',
      sub: 'Friends and power do not mix.',
      meters: { treasury: -2, populace: 1 },
      narr: "Tam takes the gold. His smile fades. 'I understand.' You're not sure he does. The door closes softly.",
    },
    up: {
      direction: 'up',
      label: 'Share dinner, nothing more',
      sub: 'An evening of normalcy.',
      meters: { stability: 1 },
      narr: 'You eat, drink, and laugh like you used to. For one evening, you are not the Sovereign. Dawn comes too quickly.',
    },
    down: {
      direction: 'down',
      label: '"I have no old friends"',
      sub: 'The Sovereign has no past.',
      meters: { authority: 2, populace: -2 },
      narr: "Tam is turned away at the gate. He tells no one. But the guards remember how he looked walking away.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION (agency: 'action') — assertive, decisive, you are the subject
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'a_budget',
    agency: 'action',
    title: 'Military Budget Act',
    portrait: '📋',
    text: (ctx) =>
      ctx.memory.flags.has('mobilized_army')
        ? 'The Military Budget Act awaits your signature. After the border mobilization, the generals argue the army needs permanent expansion.'
        : 'The Military Budget Act awaits your signature. The generals want more gold. The schools want more gold. There is not enough gold.',
    left: {
      direction: 'left',
      label: 'Fund schools instead',
      sub: 'Education over arms.',
      meters: { populace: 5, military: -5, treasury: -3 },
      narr: 'The classrooms fill. The barracks thin. The generals write angry letters. The children learn to read them.',
      setFlags: ['funded_schools'],
    },
    right: {
      direction: 'right',
      label: 'Increase military budget',
      sub: 'A strong army keeps the peace.',
      meters: { military: 5, treasury: -5, populace: -2 },
      narr: 'New weapons, new recruits, new fortifications. The army grows. The treasury shrinks. The people watch.',
      setFlags: ['armed_forces'],
    },
    up: {
      direction: 'up',
      label: 'Split funding equally',
      sub: 'Compromise: half to each.',
      meters: { stability: 2, treasury: -4 },
      narr: 'Neither side is satisfied. Both sides are funded. The definition of governance.',
    },
    down: {
      direction: 'down',
      label: 'Table the vote',
      sub: '"We need more data."',
      meters: { authority: -3, stability: -1 },
      narr: 'The act is tabled. Both factions leave frustrated. Nothing is decided, which is itself a decision.',
    },
  },

  {
    id: 'a_investigation',
    agency: 'action',
    title: 'The Investigation',
    portrait: '🕵️',
    text:
      'Reports of corruption reach your desk. Someone in the administration is skimming ' +
      'funds. The Spymaster offers to investigate — for a price.',
    left: {
      direction: 'left',
      label: 'Public investigation',
      sub: 'Transparency above all.',
      meters: { authority: 3, stability: -3, populace: 3 },
      narr: 'The investigation is public. Newspapers print every detail. Several officials resign before charges are filed.',
      setFlags: ['investigating_openly'],
    },
    right: {
      direction: 'right',
      label: 'Secret investigation',
      sub: 'Let the Spymaster work.',
      meters: { authority: 2, treasury: -2 },
      narr: 'The Spymaster disappears into the shadows. Within weeks, sealed reports arrive. The truth is uglier than you expected.',
      setFlags: ['investigating_secretly'],
    },
    up: {
      direction: 'up',
      label: 'Investigate yourself',
      sub: 'Trust no one with this.',
      meters: { authority: 5, stability: -2, treasury: -1 },
      dice: {
        die: 'd8',
        modifier: 2,
        successMeters: { authority: 5, treasury: 3 },
        failMeters: { authority: -3, stability: -3 },
        successText: 'Your personal investigation uncovers the entire network. The corrupt officials are arrested at dawn.',
        failText: 'Your amateur sleuthing tips off the conspirators. Evidence vanishes overnight. You look foolish.',
      },
    },
    down: {
      direction: 'down',
      label: 'Ignore it',
      sub: 'Some corruption is the cost of government.',
      meters: { stability: 2, populace: -3 },
      corrupt: 5,
      narr: 'You file the reports away. The skimming continues. Your ministers smile a little wider.',
    },
  },

  {
    id: 'a_harvest_festival',
    agency: 'action',
    title: 'The Harvest Festival',
    portrait: '🌾',
    text:
      'The annual harvest festival approaches. Tradition demands a royal feast, but the ' +
      'treasury is tight and the harvest was poor. The people expect celebration.',
    left: {
      direction: 'left',
      label: 'Grand feast',
      sub: 'Spend lavishly. The people need joy.',
      meters: { populace: 5, treasury: -5 },
      narr: 'The feast is magnificent. For one night, the kingdom forgets its troubles. The morning brings bills.',
    },
    right: {
      direction: 'right',
      label: 'Modest celebration',
      sub: 'A measured feast. Enough, not excess.',
      meters: { populace: 2, treasury: -2, stability: 2 },
      narr: 'The festival is pleasant but subdued. Some remember grander times. Most appreciate the effort.',
    },
    up: {
      direction: 'up',
      label: 'Cancel the festival',
      sub: '"We feast when the granaries are full."',
      meters: { treasury: 3, populace: -5 },
      narr: 'The cancellation lands like a slap. The Slums mutter darkly. The Capital pretends not to care. No one forgets.',
      districtFx: { id: 'slums', unrest: 5 },
    },
    down: {
      direction: 'down',
      label: 'Work alongside the people',
      sub: 'Help with the harvest personally.',
      meters: { populace: 4, authority: -2 },
      narr: 'You work the fields beside common folk. Your hands blister. The nobles scoff. The farmers remember.',
    },
  },

  {
    id: 'a_foreign_marriage',
    agency: 'action',
    title: 'A Foreign Proposal',
    portrait: '💌',
    text:
      'A letter arrives from across the sea. A neighboring kingdom proposes a political ' +
      'marriage alliance. The terms are generous. The implications are complex.',
    left: {
      direction: 'left',
      label: 'Accept the alliance',
      sub: 'Marry for the kingdom.',
      meters: { stability: 5, treasury: 5, authority: -3 },
      narr: 'The alliance is sealed. Your personal life becomes a treaty. The kingdom gains a powerful friend. You gain a stranger.',
    },
    right: {
      direction: 'right',
      label: 'Decline gracefully',
      sub: '"We value independence above alliance."',
      meters: { authority: 3, stability: -2 },
      narr: 'The refusal is diplomatic but clear. The foreign kingdom is disappointed. Your court is relieved. For now.',
    },
    up: {
      direction: 'up',
      label: 'Counter-propose trade deal',
      sub: 'Alliance without marriage.',
      meters: { treasury: 3, stability: 2 },
      narr: 'A trade agreement is reached instead. Less dramatic, more practical. Both kingdoms profit. The romantics are disappointed.',
    },
    down: {
      direction: 'down',
      label: 'Use it as leverage',
      sub: 'Negotiate without committing.',
      meters: { authority: 2, stability: -1 },
      corrupt: 3,
      narr: 'You string along the negotiations for weeks, extracting concessions without commitment. Effective, but not honorable.',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MORE WORLD EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'w_earthquake',
    agency: 'world',
    title: 'The Ground Shakes',
    portrait: '🌍',
    worldEvent: true,
    narration:
      'At midday the earth shudders. Buildings crack. The Temple Quarter spire tilts at a ' +
      'sickening angle. Dust fills the streets. The screaming starts before the shaking stops.',
    text: 'The earthquake has damaged the Temple Quarter and Market District. Casualty reports are still coming in.',
    autoMeters: { stability: -5, populace: -3 },
    once: true,
    left: {
      direction: 'left',
      label: 'Immediate relief effort',
      sub: 'Deploy soldiers to dig out survivors.',
      meters: { populace: 5, military: -2, treasury: -3 },
      narr: 'Soldiers claw through rubble alongside civilians. Every life saved is cheered. The cost is heavy but the morale is invaluable.',
      districtFx: { id: 'temple', unrest: -5, prosperity: -5 },
    },
    right: {
      direction: 'right',
      label: 'Rebuild the Market first',
      sub: 'Commerce must resume.',
      meters: { treasury: 2, populace: -3 },
      narr: 'The Market District is prioritized. Trade resumes quickly. The Temple Quarter waits. The faithful do not forget.',
      districtFx: { id: 'market', prosperity: 5 },
    },
    up: {
      direction: 'up',
      label: 'Pray at the damaged Temple',
      sub: 'Show faith in the face of disaster.',
      meters: { populace: 3, stability: 2 },
      narr: 'You pray among the rubble. The gesture resonates. Sister Maren calls it the most honest thing you have done.',
      districtFx: { id: 'temple', unrest: -3 },
    },
    down: {
      direction: 'down',
      label: 'Blame poor construction',
      sub: 'Find someone responsible.',
      meters: { authority: 3, populace: -4 },
      narr: 'Inspectors fan out. Builders are arrested. Some were corrupt; some were merely unlucky. The distinction blurs.',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MORE PETITIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'p_labor',
    agency: 'petition',
    title: 'Labor Dispute',
    portrait: '⚒️',
    text:
      'The dockworkers union demands better wages and shorter hours. The dock owners threaten ' +
      'to hire foreign labor. Both sides stand rigid. Trade grinds to a halt.',
    left: {
      direction: 'left',
      label: 'Side with workers',
      sub: 'Mandate fair wages.',
      meters: { populace: 5, treasury: -3, stability: -2 },
      narr: 'Wages rise. The workers celebrate. The dock owners raise prices. Everyone pays more for everything.',
      districtFx: { id: 'docks', unrest: -10, prosperity: -3 },
    },
    right: {
      direction: 'right',
      label: 'Side with owners',
      sub: 'The economy depends on trade.',
      meters: { treasury: 3, populace: -5, authority: 2 },
      narr: 'The strike is broken. Trade resumes. The workers remember. Their children will remember longer.',
      districtFx: { id: 'docks', unrest: 10 },
    },
    up: {
      direction: 'up',
      label: 'Mediate a compromise',
      sub: 'Bring both sides to table.',
      meters: { stability: 3, treasury: -1 },
      narr: 'Hours of negotiation. Modest raises. Modest concessions. Nobody is happy, which means it might work.',
      districtFx: { id: 'docks', unrest: -5 },
    },
    down: {
      direction: 'down',
      label: '"Not the crown\'s affair"',
      sub: 'Let the market decide.',
      meters: { authority: -3, stability: -3 },
      narr: 'The strike continues. Ships rot in harbor. Foreign merchants reroute. The Docks sink deeper into chaos.',
      districtFx: { id: 'docks', unrest: 8, prosperity: -8 },
    },
  },

  {
    id: 'p_temple_funding',
    agency: 'petition',
    title: 'Temple Restoration',
    portrait: '⛪',
    text:
      'The head priest petitions for funds to restore the crumbling Temple Quarter. ' +
      '"Faith holds the kingdom together, Sovereign. Without the Temple, the people lose hope."',
    left: {
      direction: 'left',
      label: 'Full restoration',
      sub: 'Fund the Temple completely.',
      meters: { populace: 4, treasury: -5, stability: 2 },
      narr: 'The Temple rises anew, grander than before. The faithful rejoice. The treasury minister weeps quietly.',
      districtFx: { id: 'temple', unrest: -10, prosperity: 5 },
    },
    right: {
      direction: 'right',
      label: 'Partial funding',
      sub: 'Enough for repairs, not glory.',
      meters: { treasury: -2, stability: 1 },
      narr: 'The repairs are functional. The Temple is stable but plain. Good enough is good enough.',
      districtFx: { id: 'temple', unrest: -3 },
    },
    up: {
      direction: 'up',
      label: 'Convert to public space',
      sub: 'A library, not a chapel.',
      meters: { authority: 3, populace: -3, stability: -2 },
      narr: 'The priests are outraged. The scholars are delighted. The building serves a new purpose. The faithful worship elsewhere.',
      districtFx: { id: 'temple', unrest: 10, prosperity: 3 },
    },
    down: {
      direction: 'down',
      label: 'Deny the petition',
      sub: '"Faith requires no gilding."',
      meters: { populace: -4, treasury: 2 },
      narr: 'The head priest leaves in stony silence. The Temple Quarter darkens. Sermons take on a sharp political edge.',
      districtFx: { id: 'temple', unrest: 8 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MORE PERSONAL
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'ps_assassination_attempt',
    agency: 'personal',
    title: 'The Blade in the Dark',
    portrait: '🗡️',
    text:
      'You wake to the sound of glass. A shadow at the window. Moonlight catches metal. ' +
      'Time slows. An assassin. In your chamber.',
    left: {
      direction: 'left',
      label: 'Fight',
      sub: 'You trained for this.',
      meters: { authority: 5, military: 2 },
      dice: {
        die: 'd10',
        modifier: 2,
        successMeters: { authority: 5, stability: 2 },
        failMeters: { authority: -3, populace: -5 },
        successText: 'You disarm the assassin. Blood on the marble. Guards arrive to find you standing over the body, breathing hard.',
        failText: 'The blade finds your shoulder. Guards burst in. The assassin escapes. You survive, but barely. Weakness is visible.',
      },
    },
    right: {
      direction: 'right',
      label: 'Call the guards',
      sub: 'Let the professionals handle it.',
      meters: { stability: 2, authority: -2 },
      narr: 'Your shout brings guards running. The assassin flees through the window. You are safe. But you look vulnerable.',
    },
    up: {
      direction: 'up',
      label: 'Talk to the assassin',
      sub: '"Who sent you?"',
      meters: { authority: 3, stability: -2 },
      narr: 'The assassin hesitates. A name escapes their lips before the guards arrive. You file it away. Trust no one.',
    },
    down: {
      direction: 'down',
      label: 'Play dead',
      sub: 'Let them think they succeeded.',
      meters: { authority: -3, stability: 3 },
      narr: 'You go limp. The assassin checks your pulse, nods, and leaves. Now you know their face. And they think you are dead.',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MORE ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'a_census',
    agency: 'action',
    title: 'The Census',
    portrait: '📊',
    text:
      'No accurate census has been taken in a generation. You need to know the true state ' +
      'of the kingdom: population, resources, wealth distribution. Knowledge is power.',
    left: {
      direction: 'left',
      label: 'Full kingdom census',
      sub: 'Count everyone and everything.',
      meters: { authority: 3, treasury: -4, stability: 2 },
      narr: 'The census takes months. The results are alarming: the Slums have triple the population your ministers estimated. The real kingdom reveals itself.',
    },
    right: {
      direction: 'right',
      label: 'Capital only',
      sub: 'Start where it matters most.',
      meters: { authority: 2, treasury: -2 },
      narr: 'The Capital census is efficient. The outer districts remain mysterious. You know the center, not the edges.',
    },
    up: {
      direction: 'up',
      label: 'Secret intelligence gathering',
      sub: 'Use the Spymaster\'s network.',
      meters: { authority: 3, treasury: -3 },
      corrupt: 2,
      narr: 'The Spymaster\'s agents count heads and catalog secrets. The data is excellent. So are the blackmail opportunities.',
    },
    down: {
      direction: 'down',
      label: 'Cancel — too expensive',
      sub: 'The kingdom was fine without data before.',
      meters: { treasury: 1, authority: -2 },
      narr: 'You govern blind. It has worked so far. The unknown unknowns pile up unseen.',
    },
  },

  {
    id: 'a_amnesty',
    agency: 'action',
    title: 'Amnesty Decree',
    portrait: '📜',
    text:
      'The prisons are overflowing — mostly petty thieves and political dissenters from the ' +
      'previous regime. An amnesty decree would empty the cells and win hearts.',
    left: {
      direction: 'left',
      label: 'Full amnesty',
      sub: 'Release all non-violent prisoners.',
      meters: { populace: 5, authority: -3, stability: -2 },
      narr: 'The cells empty. Families reunite. The streets fill with grateful faces and uncertain futures.',
    },
    right: {
      direction: 'right',
      label: 'Selective pardon',
      sub: 'Review each case individually.',
      meters: { stability: 3, authority: 2, treasury: -2 },
      narr: 'A slow, careful process. Some are freed, some remain. Justice is served, but slowly.',
    },
    up: {
      direction: 'up',
      label: 'Work release program',
      sub: 'Put them to use rebuilding.',
      meters: { treasury: 2, populace: 2, stability: 1 },
      narr: 'Prisoners join rebuilding crews. They earn their freedom and wages. Some call it reform. Some call it forced labor.',
    },
    down: {
      direction: 'down',
      label: 'Deny amnesty',
      sub: '"They broke the law."',
      meters: { authority: 3, populace: -4 },
      narr: 'The prisons stay full. The message is clear: the new Sovereign is no softer than the old. The Slums seethe.',
      districtFx: { id: 'slums', unrest: 5 },
    },
  },
];

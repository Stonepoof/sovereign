// ─── Conversation Cards ───────────────────────────────────────────────────
// 2 full 3-beat NPC conversations.

import { ConversationCard } from '../../types/cards';

export const CONVERSATION_CARDS: ConversationCard[] = [
  {
    id: 'conv_01_chancellor_warning',
    type: 'conversation',
    npcId: 'npc_chancellor',
    title: 'A Private Word',
    condition: (ctx) => ctx.turn >= 4,
    beats: [
      {
        speaker: 'Lord Aldric',
        text: 'Your Majesty, a moment in private. I have served this throne for three reigns, and I recognize the signs of trouble. The court is fracturing.',
        responses: [
          {
            label: 'Speak plainly, Chancellor.',
            effects: { authority: 1 },
            nextBeat: 1,
          },
          {
            label: 'I can handle my own court.',
            effects: { authority: 2, stability: -1 },
            nextBeat: 1,
          },
        ],
      },
      {
        speaker: 'Lord Aldric',
        text: 'There are those who smile to your face and sharpen knives behind your back. Duke Theron has been hosting dinners — intimate affairs, invitation only. The guest list reads like a who\'s who of your critics.',
        responses: [
          {
            label: 'Should I be worried?',
            effects: { stability: -1 },
            nextBeat: 2,
          },
          {
            label: 'Let them dine. I\'ll give them indigestion.',
            effects: { authority: 2 },
            nextBeat: 2,
          },
        ],
      },
      {
        speaker: 'Lord Aldric',
        text: 'Worried? No. Vigilant? Always. I recommend we place someone at those dinners. A friendly face with sharp ears. With your permission, I\'ll make the arrangements.',
        responses: [
          {
            label: 'Do it. But nothing that can be traced back to me.',
            effects: { authority: 2, stability: 2, treasury: -2 },
          },
          {
            label: 'No spying. If Theron wants to talk, I\'ll invite him myself.',
            effects: { populace: 2, authority: -1, stability: 1 },
          },
        ],
      },
    ],
    completionEffects: { stability: 1 },
  },
  {
    id: 'conv_02_rebel_plea',
    type: 'conversation',
    npcId: 'npc_rebel',
    title: 'Voice of the Forgotten',
    condition: (ctx) => ctx.turn >= 6 && ctx.meters.populace < 45,
    beats: [
      {
        speaker: 'Kael Brightwater',
        text: 'I didn\'t think you\'d see me. Most rulers don\'t meet with people from the slums. I\'ll keep it brief — my people are suffering, and the court doesn\'t care.',
        responses: [
          {
            label: 'I care. Tell me what you need.',
            effects: { populace: 2 },
            nextBeat: 1,
          },
          {
            label: 'The court has many concerns. So do I.',
            effects: { authority: 1, populace: -1 },
            nextBeat: 1,
          },
        ],
      },
      {
        speaker: 'Kael Brightwater',
        text: 'Food. Clean water. A healer who doesn\'t charge a month\'s wages for a poultice. The basics, Your Majesty. We\'re not asking for gold palaces. We\'re asking to not watch our children go hungry.',
        responses: [
          {
            label: 'I\'ll commission a relief program.',
            effects: { treasury: -3, populace: 3 },
            nextBeat: 2,
          },
          {
            label: 'Resources are tight. I\'ll do what I can.',
            effects: { populace: 1, stability: 1 },
            nextBeat: 2,
          },
        ],
      },
      {
        speaker: 'Kael Brightwater',
        text: 'Words from the throne are wind to us, begging your pardon. We\'ve heard promises before. What we need is someone inside these walls who remembers what it\'s like on the outside. Someone like me.',
        responses: [
          {
            label: 'You\'re hired. Welcome to the court, Kael.',
            effects: { populace: 5, authority: -3, stability: 2 },
          },
          {
            label: 'I\'ll consider it. Change takes time.',
            effects: { populace: -2, stability: 2, authority: 1 },
          },
        ],
      },
    ],
    completionEffects: { populace: 2 },
  },
];

/**
 * Sovereign — Conversation Cards
 *
 * 3-beat visual novel encounters embedded in the card stream.
 * Portrait + dialogue + tap-to-select responses (not swipe).
 * Injected by the card selector every 6th card when conditions are met.
 *
 * @see SOV_PRD_06_CONVERSATIONS — conversation model, beats, rapport system
 */

import type { ConversationCard } from '../../types';

// ---------------------------------------------------------------------------
// Conversation Cards
// ---------------------------------------------------------------------------

export const CONVERSATION_CARDS: ConversationCard[] = [
  // ── Tea with Elara ─────────────────────────────────────────────────────
  {
    id: 'conv_elara',
    agency: 'conversation',
    npcName: 'Advisor Elara',
    npcId: 'elara',
    portrait: '🧙',
    condition: (ctx) =>
      ctx.npcs.some((n) => n.name === 'Advisor Elara' && n.loy >= 40) &&
      !ctx.memory.flags.has('conv_elara_done'),
    setFlags: ['conv_elara_done'],
    loyaltyBonus: { name: 'Advisor Elara', perRapport: 3 },

    beats: [
      // Beat 1
      {
        speaker: "You've been busy. How are you holding up — honestly?",
        options: [
          {
            label: "Honestly? I'm drowning.",
            rapport: 2,
            reaction:
              'Elara smiles softly. "Good. Honesty is the first thing a throne takes from you. Hold onto it."',
          },
          {
            label: "I'm fine. What do you need?",
            rapport: 0,
            reaction:
              'Her warmth dims slightly. "Very well. To business then."',
          },
          {
            label: 'Better than expected, actually.',
            rapport: 1,
            reaction:
              'She tilts her head. "Interesting. Your predecessor said the same thing. Right up until the end."',
          },
        ],
      },

      // Beat 2 (conditional on rapport)
      {
        speaker: (rapport: number) =>
          rapport >= 2
            ? '"I was advisor to your predecessor too. He was brilliant. Also dead. I never told anyone what really happened in his final week."'
            : '"I didn\'t come to chat. There\'s something you should know about the Temple fires. The investigation has... gaps."',
        options: [
          {
            label: 'What happened to him?',
            rapport: 2,
            reaction:
              'Her eyes glisten. "He trusted the wrong person. I knew. I said nothing. That guilt is why I am here — to do better."',
          },
          {
            label: "I'm not him.",
            rapport: 1,
            reaction:
              '"No. You are not. That is either reassuring or terrifying. I have not decided which."',
          },
          {
            label: 'Skip the advice. Tell me about the fires.',
            rapport: 0,
            reaction:
              'She stiffens. "The temple faction has connections to the arsonists. I can say no more without proof."',
          },
        ],
      },

      // Beat 3 (conditional on rapport)
      {
        speaker: (rapport: number) =>
          rapport >= 3
            ? '"There is something else. The fires — I knew they were coming. I received warning. And I... I chose not to act. I thought I could use the chaos to position you."'
            : '"The temple faction is growing bolder. They see the fires as divine judgment. Be careful who you trust in the Temple Quarter."',
        options: [
          {
            label: 'Why tell me this?',
            rapport: 2,
            reaction:
              '"Because you asked honestly. And because I am tired of carrying it alone." She wipes her eyes. "Use me or dismiss me. But now you know."',
            meters: { stability: 3 },
          },
          {
            label: "That's a lot to process.",
            rapport: 1,
            reaction:
              '"Yes. It is. Take your time. I will be here." She pours more tea. Her hand trembles.',
          },
          {
            label: 'Can I trust you?',
            rapport: 0,
            reaction:
              '"I have given you every reason not to. And yet here I am, telling you the truth. Make of that what you will."',
            meters: { authority: 2 },
          },
        ],
      },
    ],
  },

  // ── The General's Demand ───────────────────────────────────────────────
  {
    id: 'conv_kira',
    agency: 'conversation',
    npcName: 'General Kira',
    npcId: 'kira',
    portrait: '⚔️',
    condition: (ctx) =>
      ctx.npcs.some((n) => n.name === 'General Kira' && n.loy < 35) &&
      !ctx.memory.flags.has('conv_kira_done'),
    setFlags: ['conv_kira_done'],
    loyaltyBonus: { name: 'General Kira', perRapport: 5 },

    beats: [
      // Beat 1
      {
        speaker:
          'Kira is sharpening a sword. She does not look up. "We need to talk about the army\'s future. And mine."',
        options: [
          {
            label: "I'm listening, General.",
            rapport: 1,
            reaction:
              'She pauses the whetstone. A nod. "Good. Most sovereigns talk. Few listen."',
          },
          {
            label: 'Is that a threat?',
            rapport: 0,
            reaction:
              'The sword stops. Her eyes are cold. "If it were a threat, you would not need to ask."',
          },
          {
            label: 'What do you need?',
            rapport: 2,
            reaction:
              'She looks up for the first time. Surprise flickers across her scarred face. "Someone finally asks the right question."',
          },
        ],
      },

      // Beat 2 (conditional on rapport)
      {
        speaker: (rapport: number) =>
          rapport >= 2
            ? '"At Grey Pass, we lost three hundred soldiers. Three hundred people I sent into a valley because a politician told me to. I dream about it. Every night."'
            : '"The army needs funding. Real funding. Not scraps. We face threats on every border and you give us promises."',
        options: [
          {
            label: "I'll increase the military budget.",
            rapport: 2,
            reaction:
              '"Words are easy. But I will hold you to them." The whetstone resumes, slower now.',
            meters: { military: 3, treasury: -3 },
          },
          {
            label: 'Schools matter too.',
            rapport: 0,
            reaction:
              '"Schools do not stop arrows." The blade catches light. "But I take your point."',
          },
          {
            label: 'Tell me about Grey Pass.',
            rapport: 1,
            reaction:
              'Silence. Then: "The orders came from your predecessor. \'Hold the pass.\' We held it. What was left of us."',
          },
        ],
      },

      // Beat 3 (conditional on rapport)
      {
        speaker: (rapport: number) =>
          rapport >= 3
            ? '"You are not what I expected. I expected another politician. Another liar. Perhaps I was wrong." She sheathes the sword.'
            : '"Decide where you stand, Sovereign. With the army, or against it. There is no middle ground. Not anymore."',
        options: [
          {
            label: 'I want you with me, Kira.',
            rapport: 2,
            reaction:
              'A long pause. Then she extends her hand. Not a salute — a handshake. "Then you have me. Do not make me regret it."',
          },
          {
            label: 'Noted. Dismissed.',
            rapport: 0,
            reaction:
              'She snaps to attention. The warmth, such as it was, vanishes. "As you command." The door closes hard.',
          },
          {
            label: 'What would it take?',
            rapport: 1,
            reaction:
              '"Respect. Not for the rank — for the soldiers who wear it. Start there." She turns back to her blade.',
          },
        ],
      },
    ],
  },
];

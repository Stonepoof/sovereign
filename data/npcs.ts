// ─── NPC Definitions ──────────────────────────────────────────────────────

import { NPCDef, NPCState, VoiceProfile } from '../types/npcs';

// ─── Voice Profiles ───────────────────────────────────────────────────────

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  noble_formal: {
    id: 'noble_formal',
    name: 'Noble Formal',
    vocabulary: ['indeed', 'furthermore', 'Your Majesty', 'it would be prudent', 'one must consider', 'the court requires'],
    sentenceLength: 'long',
    traits: ['formal', 'measured', 'diplomatic', 'uses titles'],
  },
  military_blunt: {
    id: 'military_blunt',
    name: 'Military Blunt',
    vocabulary: ['sir', 'enemy', 'flank', 'hold the line', 'reinforcements', 'tactical advantage'],
    sentenceLength: 'short',
    traits: ['direct', 'no-nonsense', 'strategic', 'uses military jargon'],
  },
  merchant_smooth: {
    id: 'merchant_smooth',
    name: 'Merchant Smooth',
    vocabulary: ['profit', 'investment', 'opportunity', 'trade routes', 'a fair deal', 'mutual benefit'],
    sentenceLength: 'medium',
    traits: ['persuasive', 'calculating', 'friendly on surface', 'always angling'],
  },
  clergy_pious: {
    id: 'clergy_pious',
    name: 'Clergy Pious',
    vocabulary: ['blessings', 'the divine wills', 'sacred duty', 'flock', 'guidance', 'righteous path'],
    sentenceLength: 'medium',
    traits: ['reverent', 'moralistic', 'patient', 'speaks in metaphors'],
  },
  spy_cryptic: {
    id: 'spy_cryptic',
    name: 'Spy Cryptic',
    vocabulary: ['whispers say', 'in the shadows', 'a little bird told me', 'trust no one', 'leverage', 'the truth is'],
    sentenceLength: 'short',
    traits: ['cryptic', 'knowing', 'amused', 'speaks in half-truths'],
  },
  commoner_plain: {
    id: 'commoner_plain',
    name: 'Commoner Plain',
    vocabulary: ['m\'lord', 'the folk', 'bread and butter', 'hard times', 'honest work', 'we just want'],
    sentenceLength: 'short',
    traits: ['humble', 'direct', 'emotional', 'practical'],
  },
  scholar_verbose: {
    id: 'scholar_verbose',
    name: 'Scholar Verbose',
    vocabulary: ['historically speaking', 'the texts suggest', 'a fascinating parallel', 'one could argue', 'empirically', 'consider the evidence'],
    sentenceLength: 'long',
    traits: ['intellectual', 'digressive', 'enthusiastic about knowledge', 'quotes historical figures'],
  },
};

// ─── Recruitable NPCs (6) ────────────────────────────────────────────────

export const RECRUITABLE_NPCS: NPCDef[] = [
  {
    id: 'npc_chancellor',
    name: 'Lord Aldric',
    title: 'Royal Chancellor',
    faction: 'crown',
    agency: 'decree',
    description: 'A silver-tongued statesman who has served three rulers. His loyalty is to the institution of the crown, not necessarily to you.',
    voiceProfileId: 'noble_formal',
    recruitable: true,
    advisorEffects: { authority: 3, stability: 2 },
    personality: ['pragmatic', 'loyal to the crown', 'politically astute', 'risk-averse'],
    portrait: 'Elderly man with sharp grey eyes, trimmed beard, wearing a dark velvet doublet with silver chain of office.',
  },
  {
    id: 'npc_general',
    name: 'Commander Sera',
    title: 'General of the Southern Armies',
    faction: 'military',
    agency: 'military',
    description: 'Battle-hardened and fiercely independent. She respects strength but despises pointless cruelty.',
    voiceProfileId: 'military_blunt',
    recruitable: true,
    advisorEffects: { military: 3, authority: 1 },
    personality: ['honorable', 'direct', 'impatient with politics', 'protective of soldiers'],
    portrait: 'Muscular woman in worn plate armor, short dark hair, scar across left cheek, standing at attention.',
  },
  {
    id: 'npc_merchant',
    name: 'Voss the Golden',
    title: 'Master of the Merchant Guild',
    faction: 'merchants',
    agency: 'commerce',
    description: 'Self-made and proud of it. Voss sees the kingdom as a business and the throne as its board of directors.',
    voiceProfileId: 'merchant_smooth',
    recruitable: true,
    advisorEffects: { treasury: 3, populace: 1 },
    personality: ['opportunistic', 'generous when profitable', 'dislikes waste', 'connects everything to money'],
    portrait: 'Portly man with twinkling brown eyes, silk merchant robes in deep purple, gold rings on every finger.',
  },
  {
    id: 'npc_priestess',
    name: 'Mother Elyn',
    title: 'High Priestess of the Eternal Flame',
    faction: 'clergy',
    agency: 'faith',
    description: 'Genuinely believes in divine guidance. Her moral authority exceeds yours in many parts of the realm.',
    voiceProfileId: 'clergy_pious',
    recruitable: true,
    advisorEffects: { stability: 3, populace: 2 },
    personality: ['compassionate', 'firm in beliefs', 'politically naive', 'genuinely kind'],
    portrait: 'Middle-aged woman in flowing white robes with gold embroidery, serene expression, hands clasped in prayer.',
  },
  {
    id: 'npc_spymaster',
    name: 'The Whisper',
    title: 'Spymaster',
    faction: 'underworld',
    agency: 'espionage',
    description: 'Nobody knows their real name or face. They deal in secrets and leverage. Useful, but never trustworthy.',
    voiceProfileId: 'spy_cryptic',
    recruitable: true,
    advisorEffects: { stability: 2, authority: 2 },
    personality: ['enigmatic', 'amoral', 'efficient', 'enjoys power games'],
    portrait: 'Hooded figure in dark grey cloak, face obscured, only a glint of intelligent eyes visible in shadow.',
  },
  {
    id: 'npc_rebel',
    name: 'Kael Brightwater',
    title: 'Voice of the People',
    faction: 'commoners',
    agency: 'justice',
    description: 'Former laborer turned activist. Kael speaks for those who have no voice in the halls of power.',
    voiceProfileId: 'commoner_plain',
    recruitable: true,
    advisorEffects: { populace: 4, authority: -1 },
    personality: ['passionate', 'idealistic', 'suspicious of nobility', 'speaks plainly'],
    portrait: 'Young man with calloused hands, simple brown tunic, determined jaw, fire in his dark eyes.',
  },
];

// ─── Non-Recruitable NPCs (3) ────────────────────────────────────────────

export const NON_RECRUITABLE_NPCS: NPCDef[] = [
  {
    id: 'npc_rival',
    name: 'Duke Theron',
    title: 'Duke of the Eastern Marches',
    faction: 'crown',
    agency: 'diplomacy',
    description: 'Your chief political rival. He believes the crown should be his by right of blood.',
    voiceProfileId: 'noble_formal',
    recruitable: false,
    personality: ['ambitious', 'jealous', 'intelligent', 'dangerous when cornered'],
    portrait: 'Tall man with cold blue eyes, immaculate dark hair, wearing a black surcoat with silver eagle emblem.',
  },
  {
    id: 'npc_scholar',
    name: 'Magister Orin',
    title: 'Keeper of the Great Library',
    faction: 'clergy',
    agency: 'culture',
    description: 'More interested in books than politics, but the knowledge he guards could tip the balance of power.',
    voiceProfileId: 'scholar_verbose',
    recruitable: false,
    personality: ['absent-minded', 'brilliant', 'morally neutral', 'values knowledge above all'],
    portrait: 'Thin elderly man with spectacles, ink-stained fingers, surrounded by towers of dusty tomes.',
  },
  {
    id: 'npc_foreigner',
    name: 'Ambassador Zara',
    title: 'Envoy of the Aethon Confederacy',
    faction: 'merchants',
    agency: 'diplomacy',
    description: 'Represents a powerful foreign alliance. Her proposals always come with strings attached.',
    voiceProfileId: 'merchant_smooth',
    recruitable: false,
    personality: ['charming', 'calculating', 'represents foreign interests', 'expert negotiator'],
    portrait: 'Elegant woman in exotic silks of deep red and gold, dark skin, knowing smile, ornate jewelry.',
  },
];

/** All NPCs combined */
export const ALL_NPCS: NPCDef[] = [...RECRUITABLE_NPCS, ...NON_RECRUITABLE_NPCS];

/** Create initial NPC state */
export function createInitialNPCState(npcId: string): NPCState {
  return {
    id: npcId,
    recruited: false,
    loyalty: 50,
    lastSpokeTurn: 0,
    conversationCount: 0,
    memories: [],
  };
}

/** Create all initial NPC states */
export function createAllNPCStates(): Record<string, NPCState> {
  const states: Record<string, NPCState> = {};
  for (const npc of ALL_NPCS) {
    states[npc.id] = createInitialNPCState(npc.id);
  }
  return states;
}

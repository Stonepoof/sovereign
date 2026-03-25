/**
 * Sovereign — NPC Definitions
 *
 * Six recruitable NPCs plus additional voice-profile-only characters.
 * Each NPC has a distinct voice, faction alignment, and recruitment path.
 *
 * @see SOV_PRD_05_COURT_NPC — NPC roster, voice profiles, loyalty system
 */

import type { NPCDef, VoiceProfile } from '../types';

// ---------------------------------------------------------------------------
// Voice Profiles (7 defined)
// ---------------------------------------------------------------------------

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    key: 'aldric',
    formality: 'High formal',
    rhythm: 'Measured, careful pauses',
    verbalTic: 'Always says "Sovereign"',
    hiddenTrait: 'Fear of irrelevance',
    vocabulary: 'formal',
    sentenceLength: 'long',
    traits: ['calculating', 'traditional', 'guarded'],
  },
  {
    key: 'elder',
    formality: 'Low, broken',
    rhythm: 'Fragmented, desperate',
    verbalTic: 'Trails off mid-sentence',
    hiddenTrait: 'Exhaustion from years of petitioning',
    vocabulary: 'plain',
    sentenceLength: 'short',
    traits: ['weary', 'sincere', 'desperate'],
  },
  {
    key: 'spy',
    formality: 'Mid, elliptical',
    rhythm: 'Suggestive, incomplete',
    verbalTic: 'Never finishes a thought directly',
    hiddenTrait: 'Enjoys the game of secrets',
    vocabulary: 'casual',
    sentenceLength: 'medium',
    traits: ['evasive', 'cunning', 'amused'],
  },
  {
    key: 'kira',
    formality: 'Military protocol',
    rhythm: 'Clipped, no wasted words',
    verbalTic: 'Uses "we" instead of "I"',
    hiddenTrait: 'Ambition masked as duty',
    vocabulary: 'military',
    sentenceLength: 'short',
    traits: ['disciplined', 'blunt', 'driven'],
  },
  {
    key: 'elara',
    formality: 'Warm, personal',
    rhythm: 'Flowing, intellectual',
    verbalTic: 'Asks questions she knows answers to',
    hiddenTrait: "Guilt about predecessor's death",
    vocabulary: 'formal',
    sentenceLength: 'medium',
    traits: ['warm', 'wise', 'guarded'],
  },
  {
    key: 'voss',
    formality: 'Political register',
    rhythm: 'Persuasive, rhetorical',
    verbalTic: 'Frames everything as "the people want"',
    hiddenTrait: 'Deep cynicism about democracy',
    vocabulary: 'political',
    sentenceLength: 'long',
    traits: ['charismatic', 'manipulative', 'cynical'],
  },
  {
    key: 'maren',
    formality: 'Plain spoken',
    rhythm: 'Steady, measured',
    verbalTic: 'Quotes proverbs then apologizes for it',
    hiddenTrait: 'Private crisis of faith',
    vocabulary: 'plain',
    sentenceLength: 'medium',
    traits: ['humble', 'steady', 'doubting'],
  },
];

// ---------------------------------------------------------------------------
// NPC Roster
// ---------------------------------------------------------------------------

export const NPCS: NPCDef[] = [
  {
    name: 'Advisor Elara',
    role: 'Mentor',
    faction: null,
    voiceKey: 'elara',
    portrait: '🧙',
    backstory:
      'Former advisor to the previous Sovereign. Warm and wise, but carrying guilt ' +
      'about her predecessor\'s death. She asks questions she already knows the answers to, ' +
      'guiding you toward conclusions she has already reached.',
    startingLoyalty: 50,
    recruitWeek: 0,
    recruitedAt: 'Origin card 7 (if accepted)',
  },
  {
    name: 'Senator Voss',
    role: 'Faction Leader',
    faction: 'reform',
    voiceKey: 'voss',
    portrait: '🎩',
    backstory:
      'A charismatic politician who frames every argument around what "the people want," ' +
      'though his true motivations are deeply cynical. He leads the Reform Coalition and ' +
      'sees you as a useful tool for his agenda.',
    startingLoyalty: 50,
    recruitWeek: 0,
    recruitedAt: 'Origin card 7 (Reform Coalition)',
  },
  {
    name: 'General Kira',
    role: 'Commander',
    faction: 'military',
    voiceKey: 'kira',
    portrait: '⚔️',
    backstory:
      'A stern military commander who lost 300 soldiers at Grey Pass. She speaks in clipped ' +
      'sentences and uses "we" instead of "I" — masking personal ambition as collective duty. ' +
      'Haunted by PTSD from the border wars.',
    startingLoyalty: 50,
    recruitWeek: 0,
    recruitedAt: 'Origin card 7 (Loyalist Guard)',
  },
  {
    name: 'Sister Maren',
    role: 'Populist',
    faction: 'populist',
    voiceKey: 'maren',
    portrait: '🙏',
    backstory:
      'A humble priestess who speaks plainly and quotes proverbs before apologizing for it. ' +
      'She leads the People\'s Front but is privately wrestling with a crisis of faith. ' +
      'Her steady demeanor masks deep uncertainty.',
    startingLoyalty: 50,
    recruitWeek: 0,
    recruitedAt: "Origin card 7 (People's Front)",
  },
  {
    name: 'The Champion',
    role: 'Agitator',
    faction: 'populist',
    voiceKey: null,
    portrait: '✊',
    backstory:
      'A fiery street leader from the Slums. Speaks in short, punchy sentences with a ' +
      'working-class dialect. Rose to prominence during the Slums uprising. Deeply loyal ' +
      'to the people but struggles with institutional power.',
    startingLoyalty: 40,
    recruitWeek: 8,
    recruitedAt: 'Slums Uprising card (if recruited)',
  },
  {
    name: 'Friend Tam',
    role: 'Aide',
    faction: null,
    voiceKey: null,
    portrait: '🤝',
    backstory:
      'An old friend from before your ascension. Informal and nostalgic, but unsure of ' +
      'himself in the corridors of power. Offers genuine loyalty without agenda, though ' +
      'his competence is untested.',
    startingLoyalty: 70,
    recruitWeek: 4,
    recruitedAt: 'Old Friend card (if offered position)',
  },
];

// ---------------------------------------------------------------------------
// Non-recruitable NPCs (appear in cards but not court)
// ---------------------------------------------------------------------------

export const LORD_ALDRIC: NPCDef = {
  name: 'Lord Aldric',
  role: 'Noble Petitioner',
  faction: null,
  voiceKey: 'aldric',
  portrait: '🏛️',
  backstory:
    'An aristocratic lord who always addresses you as "Sovereign." His measured speech ' +
    'and careful pauses hide a deep fear of irrelevance in the changing political landscape.',
  startingLoyalty: 45,
  recruitWeek: 999,
  recruitedAt: 'Not recruitable — appears in petition and follow-up cards',
};

export const VILLAGE_ELDER: NPCDef = {
  name: 'Village Elder',
  role: 'Petitioner',
  faction: null,
  voiceKey: 'elder',
  portrait: '👵',
  backstory:
    'A weathered elder who trails off mid-sentence, exhausted from years of petitioning ' +
    'rulers who never listen. Her desperate appeals carry the weight of communities ' +
    'that have been ignored for generations.',
  startingLoyalty: 30,
  recruitWeek: 999,
  recruitedAt: 'Not recruitable — appears in petition cards',
};

export const SPYMASTER: NPCDef = {
  name: 'The Spymaster',
  role: 'Intelligence',
  faction: null,
  voiceKey: 'spy',
  portrait: '🕵️',
  backstory:
    'A hooded figure who never finishes a thought directly. Speaks in suggestions and ' +
    'implications, enjoying the game of secrets. Their true loyalty is always in question.',
  startingLoyalty: 35,
  recruitWeek: 999,
  recruitedAt: 'Not recruitable — appears in interlude and investigation cards',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get an NPC definition by name. */
export function getNPCDef(name: string): NPCDef | undefined {
  return [...NPCS, LORD_ALDRIC, VILLAGE_ELDER, SPYMASTER].find((n) => n.name === name);
}

/** Get a voice profile by key. */
export function getVoiceProfile(key: string): VoiceProfile | undefined {
  return VOICE_PROFILES.find((v) => v.key === key);
}

// ─── Template Engine: Tier 0 (Sovereign) ─────────────────────────────────────
// Handles low-cost text generation via template substitution.
// Stores per-NPC dialogue templates with variable substitution.
// Falls back to generic templates before NPC-specific ones are generated.

import { ILLMRouter } from './llm-router';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TemplateCategory =
  | 'greeting'
  | 'farewell'
  | 'petition_intro'
  | 'petition_plea'
  | 'court_gossip'
  | 'idle_chatter'
  | 'weather_comment'
  | 'rumor'
  | 'district_report'
  | 'crisis_warning'
  | 'loyalty_check'
  | 'meter_reaction';

export interface NPCTemplate {
  npcId: string;
  category: TemplateCategory;
  templates: string[];
}

export interface TemplateVariables {
  player_name?: string;
  npc_name?: string;
  time_of_day?: string;
  mood?: string;
  location?: string;
  district?: string;
  meter_name?: string;
  meter_value?: string;
  [key: string]: string | undefined;
}

// ─── Default Generic Templates ──────────────────────────────────────────────

const DEFAULT_TEMPLATES: Record<TemplateCategory, string[]> = {
  greeting: [
    'Your Majesty. {time_greeting}.',
    'My liege, I bring word from {district}.',
    '{time_greeting}, Your Majesty. The court awaits your wisdom.',
    'You grace us with your presence.',
    'Welcome back to the throne room, Your Majesty.',
  ],
  farewell: [
    'By your leave, Your Majesty.',
    'I shall carry out your will.',
    'Long may you reign.',
    'Until the next audience, my liege.',
  ],
  petition_intro: [
    'Your Majesty, I come before you with a matter of some urgency.',
    'If it please the crown, I have a request.',
    'The people of {district} humbly petition the throne.',
    'A matter has arisen that requires royal attention.',
  ],
  petition_plea: [
    'We beg the crown to consider our plight.',
    'The situation grows dire. Only the throne can intervene.',
    'Without royal aid, {district} will suffer greatly.',
    'I would not trouble you if the matter were not grave.',
  ],
  court_gossip: [
    'Have you heard what the nobles are whispering?',
    'The court is abuzz with talk of the latest decree.',
    'I should not say this, but certain factions are restless.',
    'The treasury minister has been seen meeting in secret.',
  ],
  idle_chatter: [
    'Another day in the capital. The realm endures.',
    'The market district is bustling this {time_of_day}.',
    'Times grow uncertain. The people look to the crown.',
    'The guard patrols have been doubled. A wise precaution.',
    'I hear the harvest yields are promising this season.',
  ],
  weather_comment: [
    'A fine {time_of_day} for the realm, is it not?',
    'Storm clouds gather to the east. An omen, perhaps.',
    'The wind carries the scent of change.',
    'At least the sun shines upon the capital today.',
  ],
  rumor: [
    'There are whispers of unrest in the outer districts...',
    'The merchants speak of trouble along the trade routes.',
    'I have heard troubling reports from the border garrisons.',
    'Between us, the military council is not as unified as they appear.',
  ],
  district_report: [
    'The {district} district reports all is well, Your Majesty.',
    'There have been disturbances in {district}. Nothing the guard cannot handle.',
    '{district} prospers under your rule.',
  ],
  crisis_warning: [
    'Your Majesty, a crisis demands your immediate attention.',
    'Urgent news from {district}. The situation is deteriorating.',
    'The council urges swift action before matters worsen.',
  ],
  loyalty_check: [
    'You have my loyalty, Your Majesty. Always.',
    'I serve the crown, as my family has for generations.',
    'Trust must be earned. I am still watching.',
    'Your recent decisions give me cause for concern, but I remain faithful.',
  ],
  meter_reaction: [
    'The {meter_name} stands at {meter_value}. A matter worth considering.',
    'Your Majesty should be aware that {meter_name} has shifted.',
    'The people take note of where {meter_name} stands.',
  ],
};

// ─── Time Greeting Helper ───────────────────────────────────────────────────

function getTimeGreeting(timeOfDay?: string): string {
  switch (timeOfDay) {
    case 'dawn': return 'Good morning, early riser';
    case 'morning': return 'Good morning';
    case 'afternoon': return 'Good afternoon';
    case 'evening': return 'Good evening';
    case 'night': return 'A late hour to be about';
    default: return 'Good day';
  }
}

function getMoodAdjective(mood?: string): string {
  switch (mood) {
    case 'happy': case 'excited': case 'content': return 'cheerful';
    case 'angry': return 'irritable';
    case 'sad': return 'melancholy';
    case 'fearful': return 'uneasy';
    case 'suspicious': return 'wary';
    default: return 'calm';
  }
}

// ─── Template Engine ────────────────────────────────────────────────────────

class TemplateEngineImpl {
  /** Per-NPC custom templates: Map<npcId, Map<category, templates[]>> */
  private npcTemplates = new Map<string, Map<TemplateCategory, string[]>>();

  /**
   * Register personalized templates for an NPC (generated by Tier 2 LLM at world spawn).
   */
  registerTemplates(npcId: string, templates: NPCTemplate[]): void {
    let npcMap = this.npcTemplates.get(npcId);
    if (!npcMap) {
      npcMap = new Map();
      this.npcTemplates.set(npcId, npcMap);
    }
    for (const t of templates) {
      npcMap.set(t.category, t.templates);
    }
  }

  /**
   * Check if we have templates for this NPC+category (either custom or default).
   */
  hasTemplate(npcId: string, category: TemplateCategory): boolean {
    const npcMap = this.npcTemplates.get(npcId);
    if (npcMap?.has(category)) return true;
    return DEFAULT_TEMPLATES[category]?.length > 0;
  }

  /**
   * Generate dialogue from templates with variable substitution.
   * Uses NPC-specific templates if available, otherwise generic defaults.
   */
  generate(
    npcId: string,
    category: TemplateCategory,
    variables: TemplateVariables,
  ): string {
    // Get template pool: prefer NPC-specific, fallback to defaults
    const npcMap = this.npcTemplates.get(npcId);
    const pool = npcMap?.get(category) ?? DEFAULT_TEMPLATES[category] ?? [];

    if (pool.length === 0) {
      return 'Your Majesty...';
    }

    // Pick random template
    const template = pool[Math.floor(Math.random() * pool.length)];

    // Fill variables
    let result = template;
    const allVars: TemplateVariables = {
      ...variables,
      time_greeting: getTimeGreeting(variables.time_of_day),
      mood_adjective: getMoodAdjective(variables.mood),
    };

    for (const [key, value] of Object.entries(allVars)) {
      if (value !== undefined) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    // Clean up any unfilled variables
    result = result.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * Clear templates for an NPC (e.g., on NPC departure).
   */
  clearNPC(npcId: string): void {
    this.npcTemplates.delete(npcId);
  }

  /**
   * Clear all templates (e.g., on new game).
   */
  clearAll(): void {
    this.npcTemplates.clear();
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const templateEngine = new TemplateEngineImpl();

// ─── Batch Template Generation ──────────────────────────────────────────────
// Makes ONE Tier 2 LLM call per NPC at world creation to generate ~20 templates.

const BATCH_TEMPLATE_PROMPT = `You are generating dialogue templates for an NPC in a medieval fantasy political intrigue game called Sovereign.
The player is a ruler, and NPCs are courtiers, advisors, petitioners, and nobles.
Generate personalized dialogue templates that match the NPC's personality and speech style.
Use these placeholders in templates: {player_name}, {time_of_day}, {mood}, {location}, {npc_name}, {district}, {meter_name}, {meter_value}

Return a JSON object with this exact structure:
{
  "greeting": ["template1", "template2", "template3"],
  "farewell": ["template1", "template2"],
  "petition_intro": ["template1", "template2", "template3"],
  "court_gossip": ["template1", "template2", "template3"],
  "idle_chatter": ["template1", "template2", "template3", "template4"],
  "rumor": ["template1", "template2", "template3"],
  "loyalty_check": ["template1", "template2"]
}

Each template should be 1-2 sentences of SPOKEN DIALOGUE ONLY (no quotation marks, no narration).
Match the NPC's vocabulary level, humor style, and personality traits.
Remember: the player is a RULER, so NPCs should address them with appropriate deference or boldness.`;

export interface SovereignNPC {
  id: string;
  name: string;
  role: string;
  speechStyle?: string;
  personality?: string;
}

export async function generateNPCTemplates(
  npc: SovereignNPC,
  llmRouter: ILLMRouter,
): Promise<void> {
  const identitySummary = [
    `NPC: ${npc.name}, Role: ${npc.role}`,
    npc.personality ? `Personality: ${npc.personality}` : '',
    npc.speechStyle ? `Speech style: ${npc.speechStyle}` : '',
  ].filter(Boolean).join('\n');

  try {
    const response = await llmRouter.route({
      context: `template_batch:${npc.id}\n${identitySummary}`,
      prompt: BATCH_TEMPLATE_PROMPT,
      tier: 'budget',
      maxTokens: 600,
      temperature: 0.9,
      jsonMode: true,
    });

    // Parse JSON response
    const parsed = JSON.parse(response.text) as Record<string, string[]>;

    const templates: NPCTemplate[] = [];
    for (const [category, lines] of Object.entries(parsed)) {
      if (Array.isArray(lines) && lines.length > 0) {
        templates.push({
          npcId: npc.id,
          category: category as TemplateCategory,
          templates: lines.map(String),
        });
      }
    }

    if (templates.length > 0) {
      templateEngine.registerTemplates(npc.id, templates);
    }
  } catch (error) {
    // Non-fatal: NPC will use generic default templates
    console.warn(`[TemplateEngine] Failed to generate templates for ${npc.name}:`, error);
  }
}

// Re-export the context tag -> category mapping
export function contextToCategory(contextTag: string): TemplateCategory | null {
  const tag = contextTag.toLowerCase().split(':')[0].trim();
  const mapping: Record<string, TemplateCategory> = {
    greeting: 'greeting',
    farewell: 'farewell',
    petition_intro: 'petition_intro',
    petition_plea: 'petition_plea',
    court_gossip: 'court_gossip',
    idle_chatter: 'idle_chatter',
    weather_comment: 'weather_comment',
    rumor: 'rumor',
    district_report: 'district_report',
    crisis_warning: 'crisis_warning',
    loyalty_check: 'loyalty_check',
    meter_reaction: 'meter_reaction',
  };
  return mapping[tag] ?? null;
}

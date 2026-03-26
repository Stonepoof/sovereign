// ─── Template Engine: Tier 0 ──────────────────────────────────────────────
// Handles 50-60% of all NPC interactions at $0 cost.
// Court-themed templates with variable substitution.
// Falls back to generic templates before NPC-specific ones are generated.

import { ILLMRouter } from './llm-router';

// ─── Types ────────────────────────────────────────────────────────────────

export type TemplateCategory =
  | 'greeting'
  | 'farewell'
  | 'court_address'
  | 'decree_reaction'
  | 'treasury_report'
  | 'military_report'
  | 'church_prayer'
  | 'idle_chatter'
  | 'tavern_rumor'
  | 'peasant_plea'
  | 'merchant_pitch'
  | 'guard_report';

export interface NPCTemplate {
  npcId: string;
  category: TemplateCategory;
  templates: string[];
}

export interface TemplateVariables {
  player_title?: string;    // 'Your Majesty', 'My Liege', etc.
  npc_name?: string;
  time_of_day?: string;
  mood?: string;
  district?: string;
  week?: string;
  [key: string]: string | undefined;
}

// ─── Default Court Templates ──────────────────────────────────────────────

const DEFAULT_TEMPLATES: Record<TemplateCategory, string[]> = {
  greeting: [
    '{time_greeting}, {player_title}. The court awaits your wisdom.',
    'Ah, {player_title}. I was hoping for an audience.',
    'A word, {player_title}, if you would spare a moment.',
    '{player_title}. There are matters that require your attention.',
  ],
  farewell: [
    'By your leave, {player_title}.',
    'I shall attend to your wishes at once.',
    'Long may you reign, {player_title}.',
    'Until the next audience, {player_title}.',
  ],
  court_address: [
    'The assembled lords bow as you take the throne.',
    'Your court gathers, each face a mask of loyalty or ambition.',
    'The herald announces the day\'s petitioners.',
  ],
  decree_reaction: [
    'A wise decree, {player_title}. The people will take note.',
    'Bold words from the throne. Let us hope they bear fruit.',
    'Some will cheer this. Others will sharpen their knives.',
    'The scribes record your words. History is watching.',
  ],
  treasury_report: [
    'The coffers hold steady, {player_title}. For now.',
    'Gold flows in from the {district}, but expenses mount.',
    'The merchants demand lower taxes. The army demands higher pay.',
    'We must tighten the purse strings, or face ruin.',
  ],
  military_report: [
    'The barracks are full, {player_title}. Morale is acceptable.',
    'Our scouts report movement along the eastern border.',
    'The generals bicker over strategy. They need your firm hand.',
    'All quiet on the frontier. Perhaps too quiet.',
  ],
  church_prayer: [
    'The gods watch over your reign, {player_title}.',
    'Blessings upon the throne and all who serve it.',
    'The faithful pray for your wisdom and temperance.',
    'The temple bells ring for another day of peace.',
  ],
  idle_chatter: [
    'Strange times we live in, {player_title}.',
    'Did you hear about the incident at the {district}?',
    'The court whispers grow louder each week.',
    'I long for simpler days, before the weight of the crown.',
    'One hears the most interesting things in these halls.',
  ],
  tavern_rumor: [
    'They say a shadow moves through the {district} at night.',
    'The merchants speak of a foreign fleet seen off the coast.',
    'Word is the old families are meeting in secret.',
    'A strange illness has taken root in the lower quarters.',
  ],
  peasant_plea: [
    'Please, {player_title}, the harvest has failed and our children go hungry.',
    'We beg your mercy. The taxes are more than we can bear.',
    'The soldiers take what they please. We have no one else to turn to.',
  ],
  merchant_pitch: [
    'A fine opportunity, {player_title}. Profits for the crown and prosperity for all.',
    'I have goods from across the sea. Rare and valuable.',
    'Invest in the {district} markets and you shall see returns tenfold.',
  ],
  guard_report: [
    'All posts manned, {player_title}. The watch is vigilant.',
    'A disturbance in the {district}. Nothing the guard cannot handle.',
    'We apprehended a pickpocket near the palace gates. Minor trouble.',
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function getTimeGreeting(timeOfDay?: string): string {
  switch (timeOfDay) {
    case 'dawn':      return 'The dawn finds you well';
    case 'morning':   return 'Good morning';
    case 'afternoon': return 'Good afternoon';
    case 'evening':   return 'Good evening';
    case 'night':     return 'A late hour for audiences';
    default:          return 'Greetings';
  }
}

// ─── Template Engine ──────────────────────────────────────────────────────

class TemplateEngineImpl {
  private npcTemplates = new Map<string, Map<TemplateCategory, string[]>>();

  /** Register personalized templates for an NPC */
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

  /** Check if templates exist for this NPC+category */
  hasTemplate(npcId: string, category: TemplateCategory): boolean {
    const npcMap = this.npcTemplates.get(npcId);
    if (npcMap?.has(category)) return true;
    return DEFAULT_TEMPLATES[category]?.length > 0;
  }

  /** Generate dialogue from templates with variable substitution */
  generate(
    npcId: string,
    category: TemplateCategory,
    variables: TemplateVariables,
  ): string {
    const npcMap = this.npcTemplates.get(npcId);
    const pool = npcMap?.get(category) ?? DEFAULT_TEMPLATES[category] ?? [];

    if (pool.length === 0) {
      return 'The court is silent.';
    }

    const template = pool[Math.floor(Math.random() * pool.length)];

    let result = template;
    const allVars: TemplateVariables = {
      ...variables,
      time_greeting: getTimeGreeting(variables.time_of_day),
      player_title: variables.player_title ?? 'Your Majesty',
    };

    for (const [key, value] of Object.entries(allVars)) {
      if (value !== undefined) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    // Clean up unfilled variables
    result = result.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();

    return result;
  }

  /** Clear templates for an NPC */
  clearNPC(npcId: string): void {
    this.npcTemplates.delete(npcId);
  }

  /** Clear all templates (new game) */
  clearAll(): void {
    this.npcTemplates.clear();
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────

export const templateEngine = new TemplateEngineImpl();

// ─── Batch Template Generation ────────────────────────────────────────────
// One budget-tier LLM call per NPC to generate court-themed templates.

const BATCH_TEMPLATE_PROMPT = `You are generating dialogue templates for a court NPC in a medieval political intrigue game called Sovereign.
Generate personalized dialogue templates that match the NPC's personality, rank, and speech style.
Use these placeholders: {player_title}, {time_of_day}, {mood}, {district}, {npc_name}, {week}

Return a JSON object with this exact structure:
{
  "greeting": ["template1", "template2", "template3"],
  "farewell": ["template1", "template2"],
  "court_address": ["template1", "template2"],
  "decree_reaction": ["template1", "template2", "template3"],
  "idle_chatter": ["template1", "template2", "template3", "template4"],
  "tavern_rumor": ["template1", "template2"]
}

Each template should be 1-2 sentences of SPOKEN DIALOGUE ONLY (no quotation marks, no narration).
The tone should be courtly, political, and befitting the NPC's station and allegiances.`;

export interface BatchNPCInfo {
  id: string;
  name: string;
  role: string;
  faction: string;
  personality?: string;
}

export async function generateNPCTemplates(
  npc: BatchNPCInfo,
  llmRouter: ILLMRouter,
): Promise<void> {
  const identitySummary = [
    `NPC: ${npc.name}, Title: ${npc.role}`,
    `Faction: ${npc.faction}`,
    npc.personality ? `Personality: ${npc.personality}` : '',
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
    console.warn(`[TemplateEngine] Failed to generate templates for ${npc.name}:`, error);
  }
}

/** Map context tags to template categories */
export function contextToCategory(contextTag: string): TemplateCategory | null {
  const tag = contextTag.toLowerCase().split(':')[0].trim();
  const mapping: Record<string, TemplateCategory> = {
    greeting: 'greeting',
    farewell: 'farewell',
    court_chatter: 'court_address',
    decree_flavor: 'decree_reaction',
    treasury_note: 'treasury_report',
    guard_report: 'guard_report',
    idle_remark: 'idle_chatter',
    merchant_gossip: 'merchant_pitch',
    peasant_plea: 'peasant_plea',
    church_prayer: 'church_prayer',
    tavern_rumor: 'tavern_rumor',
    district_report: 'guard_report',
  };
  return mapping[tag] ?? null;
}

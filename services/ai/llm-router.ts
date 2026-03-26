// ─── LLM Router for Sovereign ─────────────────────────────────────────────
// Supports both OpenAI and Anthropic APIs for text generation.
// Falls back gracefully between providers.
// Adapted from Isekai Land with Sovereign-specific tier tags.

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getAIConfig, isValidApiKey } from '../../config/ai-config';

// ─── Types ────────────────────────────────────────────────────────────────

export type AITier = 'template' | 'local' | 'budget' | 'premium';

export interface AIRequest {
  context: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  tier?: AITier;
  jsonMode?: boolean;
}

export interface AIResponse {
  text: string;
  tier: AITier;
  tokensUsed: number;
  cached: boolean;
}

export interface ILLMRouter {
  route(request: AIRequest): Promise<AIResponse>;
  classifyTier(context: string): AITier;
}

// ─── Cost Estimation ──────────────────────────────────────────────────────

function estimateCost(model: string, tokensUsed: number): number {
  const rates: Record<string, number> = {
    'claude-sonnet-4-6-20250514': 0.009,
    'claude-haiku-4-5-20251001': 0.002,
    'gpt-4o': 0.0075,
    'gpt-4o-mini': 0.0003,
  };
  const rate = rates[model] ?? 0.005;
  return parseFloat(((tokensUsed / 1000) * rate).toFixed(6));
}

// ─── Tier Classification (Sovereign-specific) ─────────────────────────────

const TIER_0_TAGS = new Set([
  'greeting', 'farewell', 'court_chatter', 'district_report',
  'idle_remark', 'decree_flavor', 'treasury_note', 'guard_report',
  'merchant_gossip', 'peasant_plea', 'church_prayer', 'tavern_rumor',
]);

const TIER_2_TAGS = new Set([
  'week_narration', 'onboarding_narration', 'district_crisis',
]);

const TIER_3_TAGS = new Set([
  'coronation', 'assassination', 'betrayal_scene', 'death_scene',
  'rebellion', 'world_generation', 'npc_generation', 'endgame_climax',
  'divine_intervention', 'template_batch',
]);

const PREMIUM_KEYWORDS = [
  'world gen', 'world generation', 'generate world',
  'coronation', 'assassination', 'final week',
  'rebellion', 'coup', 'betrayal',
  'death scene', 'endgame', 'climax',
  'divine', 'prophecy', 'oracle',
];

const TEMPLATE_KEYWORDS = [
  'greeting', 'farewell', 'goodbye', 'hello',
  'weather', 'idle', 'chatter', 'report',
  'direction', 'where is', 'rumor',
];

// ─── API Call Timeout ─────────────────────────────────────────────────────

const API_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((val) => { clearTimeout(timer); resolve(val); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

// ─── Production Router ────────────────────────────────────────────────────

export class EnhancedLLMRouter implements ILLMRouter {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private cache = new Map<string, { response: AIResponse; expiresAt: number }>();
  private provider: 'openai' | 'anthropic' | 'none' = 'none';

  constructor() {
    const config = getAIConfig();

    if (isValidApiKey(config.OPENAI_API_KEY)) {
      this.openai = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });
      this.provider = 'openai';
      console.log('[LLMRouter] OpenAI initialized');
    }

    if (isValidApiKey(config.ANTHROPIC_API_KEY)) {
      this.anthropic = new Anthropic({
        apiKey: config.ANTHROPIC_API_KEY,
        dangerouslyAllowBrowser: true,
      });
      this.provider = 'anthropic';
      console.log('[LLMRouter] Anthropic initialized');
    }

    // Prefer Anthropic for narrative-heavy political intrigue
    if (this.anthropic && this.openai) {
      this.provider = 'anthropic';
      console.log('[LLMRouter] Both APIs available, preferring Anthropic for court narrative');
    }

    if (this.provider === 'none') {
      console.warn('[LLMRouter] No valid API keys found — all calls will use fallback text');
    }
  }

  classifyTier(context: string): AITier {
    const lower = context.toLowerCase();
    const tag = lower.split(':')[0].trim();

    if (TIER_0_TAGS.has(tag)) return 'template';
    if (TIER_2_TAGS.has(tag)) return 'budget';
    if (TIER_3_TAGS.has(tag)) return 'premium';

    for (const kw of TEMPLATE_KEYWORDS) {
      if (lower.includes(kw)) return 'template';
    }
    for (const kw of PREMIUM_KEYWORDS) {
      if (lower.includes(kw)) return 'premium';
    }

    if (context.length < 40) return 'template';
    return 'budget';
  }

  async route(request: AIRequest): Promise<AIResponse> {
    const tier = request.tier ?? this.classifyTier(request.context);
    const effectiveTier = tier === 'template' || tier === 'local' ? 'budget' : tier;

    // Check cache
    if (!request.jsonMode) {
      const cacheKey = this.getCacheKey(request.context, request.prompt);
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return { ...cached.response, cached: true };
      }
    }

    try {
      let response: AIResponse;

      if (this.provider === 'anthropic' && this.anthropic) {
        response = await this.routeAnthropic(request, effectiveTier);
      } else if (this.provider === 'openai' && this.openai) {
        response = await this.routeOpenAI(request, effectiveTier);
      } else {
        return this.getFallbackResponse(effectiveTier);
      }

      // Cache the response
      if (!request.jsonMode) {
        const cacheKey = this.getCacheKey(request.context, request.prompt);
        const ttl = effectiveTier === 'premium' ? 15 * 60 * 1000 : 5 * 60 * 1000;
        this.cache.set(cacheKey, { response, expiresAt: Date.now() + ttl });
      }

      return response;
    } catch (error: any) {
      console.error(`[LLM] Tier ${effectiveTier} | FAILED: ${error.message} | Falling back...`);

      // Try fallback provider
      try {
        if (this.provider === 'anthropic' && this.openai) {
          return await this.routeOpenAI(request, effectiveTier);
        } else if (this.provider === 'openai' && this.anthropic) {
          return await this.routeAnthropic(request, effectiveTier);
        }
      } catch (fallbackError: any) {
        console.error(`[LLM] Fallback FAILED: ${fallbackError.message}`);
      }

      return this.getFallbackResponse(effectiveTier);
    }
  }

  private async routeAnthropic(request: AIRequest, tier: AITier): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    const model = tier === 'premium' ? 'claude-sonnet-4-6-20250514' : 'claude-haiku-4-5-20251001';
    const maxTokens = request.maxTokens ?? (tier === 'premium' ? 1000 : 500);

    console.log(`[LLM] Tier ${tier} | Context: ${request.context.substring(0, 60)} | Model: ${model}`);

    const response = await withTimeout(
      this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: request.temperature ?? 0.7,
        messages: [
          { role: 'user', content: `${request.prompt}\n\nContext: ${request.context}` },
        ],
      }),
      API_TIMEOUT_MS,
      `Anthropic ${model}`,
    );

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    const cost = estimateCost(model, tokensUsed);

    console.log(`[LLM] Tier ${tier} | Response: ${text.substring(0, 100)}... | Cost: ~$${cost}`);

    return { text, tier, tokensUsed, cached: false };
  }

  private async routeOpenAI(request: AIRequest, tier: AITier): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const model = tier === 'premium' ? 'gpt-4o' : 'gpt-4o-mini';
    const maxTokens = request.maxTokens ?? (tier === 'premium' ? 1000 : 500);

    console.log(`[LLM] Tier ${tier} | Context: ${request.context.substring(0, 60)} | Model: ${model}`);

    const completion = await withTimeout(
      this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: request.prompt },
          { role: 'user', content: request.context },
        ],
        max_tokens: maxTokens,
        temperature: request.temperature ?? 0.7,
        ...(request.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      API_TIMEOUT_MS,
      `OpenAI ${model}`,
    );

    const text = completion.choices[0]?.message?.content ?? '';
    const tokensUsed = completion.usage?.total_tokens ?? 0;
    const cost = estimateCost(model, tokensUsed);

    console.log(`[LLM] Tier ${tier} | Response: ${text.substring(0, 100)}... | Cost: ~$${cost}`);

    return { text, tier, tokensUsed, cached: false };
  }

  private getFallbackResponse(tier: AITier): AIResponse {
    const fallbackTexts: Record<AITier, string> = {
      template: 'The court is quiet today.',
      local: 'A messenger arrives with unclear tidings.',
      budget: 'A messenger arrives with unclear tidings.',
      premium: 'The weight of the crown presses upon you as fate weaves its inscrutable design across the realm.',
    };

    return {
      text: fallbackTexts[tier] || fallbackTexts.budget,
      tier,
      tokensUsed: 0,
      cached: false,
    };
  }

  private getCacheKey(context: string, prompt: string): string {
    const input = (context + '|' + prompt).slice(0, 200);
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return String(hash);
  }
}

// ─── Mock Router ──────────────────────────────────────────────────────────

export class MockLLMRouter implements ILLMRouter {
  classifyTier(context: string): AITier {
    const lower = context.toLowerCase();
    if (context.length < 50) return 'template';
    for (const kw of PREMIUM_KEYWORDS) {
      if (lower.includes(kw)) return 'premium';
    }
    return 'budget';
  }

  async route(request: AIRequest): Promise<AIResponse> {
    const tier = request.tier ?? this.classifyTier(request.context);

    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    const responses: Record<AITier, string[]> = {
      template: [
        'The court awaits your decision, Your Majesty.',
        'Another day upon the throne. The petitioners gather.',
        'The morning light falls upon the throne room.',
      ],
      local: [
        'A minor lord approaches with a modest request.',
        'The city watch reports all is quiet in the capital.',
      ],
      budget: [
        'Your advisor leans close and whispers of trouble in the eastern districts. The merchants grow restless, and the treasury dwindles.',
        'A delegation from the temple quarter arrives bearing gifts and grievances in equal measure. Their loyalty hangs in the balance.',
        'Reports from the frontier suggest enemy scouts have been sighted. Your generals await your command.',
      ],
      premium: [
        'The very foundations of your rule tremble as ancient alliances fracture and new powers emerge from the shadows. The choices you make in this moment will echo through generations, shaping the fate of every soul who calls this kingdom home.',
        'Before the assembled court, the high priest reveals a prophecy long hidden in the temple vaults. It speaks of a ruler who must choose between the crown and their conscience, between power and the people who granted it.',
      ],
    };

    const texts = responses[tier] || responses.budget;
    const text = texts[Math.floor(Math.random() * texts.length)];
    const tokensUsed = 50 + Math.floor(Math.random() * 200);

    console.log(`[LLM] Tier ${tier} | Context: ${request.context.substring(0, 60)} | Model: mock | Tokens: ${tokensUsed}`);

    return { text, tier, tokensUsed, cached: false };
  }
}

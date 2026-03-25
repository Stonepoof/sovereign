// ─── Sovereign LLM Router ────────────────────────────────────────────────────
// Dual-provider (OpenAI + Anthropic) router with tiered classification.
// Falls back gracefully between providers.

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getAIConfig, isValidApiKey } from '@/config/ai-config';

// Re-export types
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

// ─── Tier Classification (Sovereign) ──────────────────────────────────────

const TIER_0_TAGS = new Set([
  'district_info', 'meter_description', 'week_narration_simple', 'card_flavor',
]);

const TIER_2_TAGS = new Set([
  'npc_dialogue', 'card_narration', 'impact_text', 'dice_narration',
]);

const TIER_3_TAGS = new Set([
  'conversation_beat', 'crisis_narration', 'death_scene',
  'world_generation', 'origin_narration', 'trait_ceremony',
]);

const PREMIUM_KEYWORDS = [
  'world gen', 'world generation', 'generate world',
  'crisis narration', 'crisis event',
  'death scene', 'ruler death', 'assassination',
  'origin narration', 'origin story',
  'trait ceremony', 'coronation',
  'conversation beat', 'important dialogue',
];

const TEMPLATE_KEYWORDS = [
  'district info', 'district description',
  'meter description', 'meter status',
  'week narration', 'week summary',
  'card flavor', 'flavor text',
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

// ─── Enhanced Production Router ────────────────────────────────────────────

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

    // Prefer Anthropic if both are available (better for narrative)
    if (this.anthropic && this.openai) {
      this.provider = 'anthropic';
      console.log('[LLMRouter] Both APIs available, preferring Anthropic for narrative');
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
        this.cache.set(cacheKey, {
          response,
          expiresAt: Date.now() + ttl,
        });
      }

      return response;

    } catch (error: any) {
      console.error(`[LLM] Tier ${effectiveTier} | FAILED: ${error.message} | Falling back...`);

      // Try fallback provider
      try {
        if (this.provider === 'anthropic' && this.openai) {
          console.log('[LLMRouter] Falling back to OpenAI');
          return await this.routeOpenAI(request, effectiveTier);
        } else if (this.provider === 'openai' && this.anthropic) {
          console.log('[LLMRouter] Falling back to Anthropic');
          return await this.routeAnthropic(request, effectiveTier);
        }
      } catch (fallbackError: any) {
        console.error(`[LLM] Tier ${effectiveTier} | FAILED: ${fallbackError.message} | Falling back...`);
      }

      return this.getFallbackResponse(effectiveTier);
    }
  }

  private async routeAnthropic(request: AIRequest, tier: AITier): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    const model = tier === 'premium' ? 'claude-sonnet-4-6-20250514' : 'claude-haiku-4-5-20251001';
    const maxTokens = request.maxTokens ?? (tier === 'premium' ? 1000 : 500);

    console.log(`[LLM] Tier ${tier} | Context: ${request.context.substring(0, 60)} | Model: ${model} | Tokens: ${maxTokens}`);

    const response = await withTimeout(
      this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: request.temperature ?? 0.7,
        messages: [
          {
            role: 'user',
            content: `${request.prompt}\n\nContext: ${request.context}`
          }
        ],
      }),
      API_TIMEOUT_MS,
      `Anthropic ${model}`
    );

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    const cost = estimateCost(model, tokensUsed);

    console.log(`[LLM] Tier ${tier} | Response: ${text.substring(0, 100)}... | Cost: ~$${cost}`);

    return {
      text,
      tier,
      tokensUsed,
      cached: false,
    };
  }

  private async routeOpenAI(request: AIRequest, tier: AITier): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const model = tier === 'premium' ? 'gpt-4o' : 'gpt-4o-mini';
    const maxTokens = request.maxTokens ?? (tier === 'premium' ? 1000 : 500);

    console.log(`[LLM] Tier ${tier} | Context: ${request.context.substring(0, 60)} | Model: ${model} | Tokens: ${maxTokens}`);

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
      `OpenAI ${model}`
    );

    const text = completion.choices[0]?.message?.content ?? '';
    const tokensUsed = completion.usage?.total_tokens ?? 0;
    const cost = estimateCost(model, tokensUsed);

    console.log(`[LLM] Tier ${tier} | Response: ${text.substring(0, 100)}... | Cost: ~$${cost}`);

    return {
      text,
      tier,
      tokensUsed,
      cached: false,
    };
  }

  private getFallbackResponse(tier: AITier): AIResponse {
    const fallbackTexts: Record<AITier, string> = {
      template: 'The court is quiet today.',
      local: 'Something stirs in the realm, but the details are unclear.',
      budget: 'Something stirs in the realm, but the details are unclear.',
      premium: 'A pivotal moment unfolds in the kingdom, though its full significance remains veiled.',
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

// Mock router for development
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

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const responses: Record<AITier, string[]> = {
      template: [
        'The morning bells toll across the capital.',
        'A cool wind stirs the banners in the courtyard.',
        'The throne room stands empty at this hour.',
      ],
      local: [
        'A petitioner waits at the gate with urgent news.',
        'Rumors spread through the market district.',
      ],
      budget: [
        'A noble approaches with a petition in hand. "Your Majesty, the eastern district requires attention," they say with a bow.',
        'The treasury minister arrives with a stack of ledgers, concern etched on their face.',
        'Strange reports arrive from the border. The guards speak of movements in the night.',
      ],
      premium: [
        'The weight of the crown bears down as you survey the kingdom from the tower. Every decision ripples outward — the populace watches, the nobles scheme, and the treasury dwindles. What kind of ruler will you become?',
        'Before you lies a kingdom on the precipice of change. The old alliances crumble, new threats emerge from the shadows, and your council is divided. The choices ahead will define an era.',
      ],
    };

    const texts = responses[tier] || responses.budget;
    const text = texts[Math.floor(Math.random() * texts.length)];
    const tokensUsed = 50 + Math.floor(Math.random() * 200);

    console.log(`[LLM] Tier ${tier} | Context: ${request.context.substring(0, 60)} | Model: mock | Tokens: ${tokensUsed}`);
    console.log(`[LLM] Tier ${tier} | Response: ${text.substring(0, 100)}... | Cost: ~$0`);

    return { text, tier, tokensUsed, cached: false };
  }
}

// ─── RunPod Image Generation Client ──────────────────────────────────────
// Self-hosted Illustrious XL on RunPod Serverless.
// Interface + Mock pattern for development.
// Adapted for Sovereign with court/political image categories.

// ─── RunPod-specific types ────────────────────────────────────────────────

export interface RunPodImageRequest {
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
  sampler: string;
  lora_id?: string;
  lora_weight?: number;
  style_preset?: string;
}

export interface RunPodJobResponse {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output?: {
    image_url: string;
    seed: number;
    generation_time_ms: number;
  };
  error?: string;
}

// ─── Image Type Taxonomy (Sovereign) ──────────────────────────────────────

export type ImageCategory =
  | 'ruler_portrait'
  | 'npc_portrait'
  | 'throne_room'
  | 'district_scene'
  | 'card_illustration'
  | 'event_scene'
  | 'battle_scene'
  | 'coronation'
  | 'death_scene'
  | 'map_overview';

export const IMAGE_DIMENSIONS: Record<ImageCategory, { width: number; height: number }> = {
  ruler_portrait:    { width: 512, height: 768 },
  npc_portrait:      { width: 512, height: 768 },
  throne_room:       { width: 1024, height: 576 },
  district_scene:    { width: 768, height: 512 },
  card_illustration: { width: 768, height: 512 },
  event_scene:       { width: 768, height: 512 },
  battle_scene:      { width: 768, height: 512 },
  coronation:        { width: 768, height: 1024 },
  death_scene:       { width: 768, height: 512 },
  map_overview:      { width: 1024, height: 576 },
};

// ─── Prompt Builder ───────────────────────────────────────────────────────

export function buildImagePrompt(
  category: ImageCategory,
  description: string,
  style: string = 'painted',
): RunPodImageRequest {
  const dims = IMAGE_DIMENSIONS[category];

  const stylePrefix = style === 'painted'
    ? 'masterpiece, best quality, oil painting style, medieval fantasy, dramatic lighting, '
    : 'masterpiece, best quality, fantasy illustration, detailed, regal, ';

  const negativePrompt = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, deformed, ugly, modern';

  const categoryPrompts: Record<ImageCategory, string> = {
    ruler_portrait:    `${stylePrefix}royal portrait, regal bearing, crown, upper body, ${description}`,
    npc_portrait:      `${stylePrefix}character portrait, upper body, medieval court, ${description}`,
    throne_room:       `${stylePrefix}grand throne room, pillars, tapestries, ${description}`,
    district_scene:    `${stylePrefix}medieval city district, atmospheric, ${description}`,
    card_illustration: `${stylePrefix}story moment, dramatic composition, ${description}`,
    event_scene:       `${stylePrefix}political event, court intrigue, ${description}`,
    battle_scene:      `${stylePrefix}medieval battle, dynamic action, dramatic, ${description}`,
    coronation:        `${stylePrefix}coronation ceremony, grand cathedral, divine light, ${description}`,
    death_scene:       `${stylePrefix}dramatic death scene, somber, emotional, cinematic, ${description}`,
    map_overview:      `${stylePrefix}fantasy kingdom map, bird's eye view, parchment style, ${description}`,
  };

  return {
    prompt: categoryPrompts[category],
    negative_prompt: negativePrompt,
    width: dims.width,
    height: dims.height,
    steps: 25,
    cfg_scale: 7,
    sampler: 'euler_a',
  };
}

// ─── Interface ────────────────────────────────────────────────────────────

export interface IRunPodClient {
  submitJob(request: RunPodImageRequest): Promise<string>;
  checkJob(jobId: string): Promise<RunPodJobResponse>;
  waitForJob(jobId: string, timeoutMs?: number): Promise<RunPodJobResponse>;
  generateImage(category: ImageCategory, description: string): Promise<string>;
}

// ─── Mock Implementation ──────────────────────────────────────────────────

export class MockRunPodClient implements IRunPodClient {
  private jobs = new Map<string, RunPodJobResponse>();
  private jobCounter = 0;

  async submitJob(request: RunPodImageRequest): Promise<string> {
    const id = `mock_job_${++this.jobCounter}`;
    this.jobs.set(id, { id, status: 'IN_QUEUE' });

    setTimeout(() => {
      this.jobs.set(id, {
        id,
        status: 'COMPLETED',
        output: {
          image_url: `placeholder://runpod/${id}/${encodeURIComponent(request.prompt.slice(0, 50))}`,
          seed: Math.floor(Math.random() * 999999),
          generation_time_ms: 2000 + Math.random() * 3000,
        },
      });
    }, 500);

    return id;
  }

  async checkJob(jobId: string): Promise<RunPodJobResponse> {
    return this.jobs.get(jobId) ?? { id: jobId, status: 'FAILED', error: 'Job not found' };
  }

  async waitForJob(jobId: string, timeoutMs: number = 30000): Promise<RunPodJobResponse> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const job = await this.checkJob(jobId);
      if (job.status === 'COMPLETED' || job.status === 'FAILED') return job;
      await new Promise((r) => setTimeout(r, 200));
    }
    return { id: jobId, status: 'FAILED', error: 'Timeout' };
  }

  async generateImage(category: ImageCategory, description: string): Promise<string> {
    const request = buildImagePrompt(category, description);
    const jobId = await this.submitJob(request);
    const result = await this.waitForJob(jobId);
    return result.output?.image_url ?? `placeholder://error/${category}`;
  }
}

// ─── Production Implementation ────────────────────────────────────────────

export class RunPodClient implements IRunPodClient {
  private apiKey: string;
  private endpointId: string;
  private baseUrl: string;

  constructor(apiKey: string, endpointId: string) {
    this.apiKey = apiKey;
    this.endpointId = endpointId;
    this.baseUrl = `https://api.runpod.ai/v2/${endpointId}`;
  }

  async submitJob(request: RunPodImageRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ input: request }),
    });
    const data = await response.json();
    return data.id;
  }

  async checkJob(jobId: string): Promise<RunPodJobResponse> {
    const response = await fetch(`${this.baseUrl}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    return response.json();
  }

  async waitForJob(jobId: string, timeoutMs: number = 60000): Promise<RunPodJobResponse> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const job = await this.checkJob(jobId);
      if (job.status === 'COMPLETED' || job.status === 'FAILED') return job;
      await new Promise((r) => setTimeout(r, 1000));
    }
    return { id: jobId, status: 'FAILED', error: 'Timeout' };
  }

  async generateImage(category: ImageCategory, description: string): Promise<string> {
    const request = buildImagePrompt(category, description);
    const jobId = await this.submitJob(request);
    const result = await this.waitForJob(jobId);
    if (result.status === 'FAILED') throw new Error(result.error ?? 'Generation failed');
    return result.output!.image_url;
  }
}

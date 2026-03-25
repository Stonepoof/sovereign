// ─── RunPod Image Generation Client (Sovereign) ─────────────────────────────
// Self-hosted Illustrious XL on RunPod Serverless.
// Interface + Mock pattern for development.

// ─── RunPod-specific types ───────────────────────────────────────────────────

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

// ─── Image Type Taxonomy (Sovereign) ────────────────────────────────────────

export type ImageCategory =
  | 'npc_portrait'
  | 'card_art'
  | 'district_icon'
  | 'world_scene'
  | 'death_scene'
  | 'origin_scene';

export const IMAGE_DIMENSIONS: Record<ImageCategory, { width: number; height: number }> = {
  npc_portrait: { width: 512, height: 512 },
  card_art: { width: 780, height: 400 },
  district_icon: { width: 128, height: 128 },
  world_scene: { width: 1024, height: 576 },
  death_scene: { width: 768, height: 512 },
  origin_scene: { width: 768, height: 512 },
};

// ─── Prompt Builder ──────────────────────────────────────────────────────────

export function buildImagePrompt(
  category: ImageCategory,
  description: string,
  style: string = 'anime',
): RunPodImageRequest {
  const dims = IMAGE_DIMENSIONS[category];

  const stylePrefix = style === 'anime'
    ? 'masterpiece, best quality, anime style, political intrigue, medieval fantasy, '
    : 'masterpiece, best quality, fantasy illustration, political intrigue, medieval, ';

  const negativePrompt = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, deformed, ugly';

  const categoryPrompts: Record<ImageCategory, string> = {
    npc_portrait: `${stylePrefix}character portrait, upper body, courtier, noble, ${description}`,
    card_art: `${stylePrefix}card illustration, dramatic scene, ${description}`,
    district_icon: `${stylePrefix}icon, simple, symbolic, ${description}`,
    world_scene: `${stylePrefix}kingdom landscape, wide shot, ${description}`,
    death_scene: `${stylePrefix}dramatic, emotional, cinematic, ${description}`,
    origin_scene: `${stylePrefix}coronation, ceremony, dramatic lighting, ${description}`,
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

// ─── RunPod Client Interface ────────────────────────────────────────────────

export interface IRunPodClient {
  submitJob(request: RunPodImageRequest): Promise<string>;
  checkJob(jobId: string): Promise<RunPodJobResponse>;
  waitForJob(jobId: string, timeoutMs?: number): Promise<RunPodJobResponse>;
  generateImage(category: ImageCategory, description: string): Promise<string>;
}

// ─── Mock Implementation ─────────────────────────────────────────────────────

export class MockRunPodClient implements IRunPodClient {
  private jobs = new Map<string, RunPodJobResponse>();
  private jobCounter = 0;

  async submitJob(request: RunPodImageRequest): Promise<string> {
    const id = `mock_job_${++this.jobCounter}`;
    this.jobs.set(id, {
      id,
      status: 'IN_QUEUE',
    });

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
      await new Promise(r => setTimeout(r, 200));
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

// ─── Production Implementation ──────────────────────────────────────────────

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
      await new Promise(r => setTimeout(r, 1000));
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

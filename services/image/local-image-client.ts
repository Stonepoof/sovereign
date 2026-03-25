// ─── Local Image Generation Client ────────────────────────────────────────
// Connects to local Python server running Illustrious XL
// Compatible with RunPod interface for easy switching

import { IRunPodClient, ImageCategory, buildImagePrompt, RunPodJobResponse } from './runpod-client';

export class LocalImageClient implements IRunPodClient {
  private baseUrl: string;
  private jobs = new Map<string, RunPodJobResponse>();
  private jobCounter = 0;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async submitJob(request: any): Promise<string> {
    const jobId = `local_job_${++this.jobCounter}`;

    try {
      // Submit to local server
      const response = await fetch(`${this.baseUrl}/v2/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: request,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Store result
      this.jobs.set(jobId, {
        id: jobId,
        status: result.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
        output: result.output,
        error: result.error,
      });

      return jobId;

    } catch (error) {
      console.error('[LocalImageClient] Generation failed:', error);

      // Store error result
      this.jobs.set(jobId, {
        id: jobId,
        status: 'FAILED',
        error: String(error),
      });

      return jobId;
    }
  }

  async checkJob(jobId: string): Promise<RunPodJobResponse> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return {
        id: jobId,
        status: 'FAILED',
        error: 'Job not found',
      };
    }
    return job;
  }

  async waitForJob(jobId: string, timeoutMs: number = 30000): Promise<RunPodJobResponse> {
    // Local generation is immediate, so just return the job
    return this.checkJob(jobId);
  }

  async generateImage(category: ImageCategory, description: string): Promise<string> {
    try {
      console.log(`[LocalImageClient] Generating ${category}: ${description.slice(0, 50)}...`);

      const request = buildImagePrompt(category, description, 'anime');
      const jobId = await this.submitJob(request);
      const result = await this.waitForJob(jobId);

      if (result.status === 'COMPLETED' && result.output?.image_url) {
        console.log(`[LocalImageClient] Generated successfully`);
        return result.output.image_url;
      } else {
        console.warn(`[LocalImageClient] Generation failed:`, result.error);
        return `placeholder://local-error/${category}`;
      }

    } catch (error) {
      console.error('[LocalImageClient] Error:', error);
      return `placeholder://local-error/${category}`;
    }
  }

  // Health check for local server
  async isHealthy(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const health = await response.json();
        return health.status === 'healthy' && health.model_loaded;
      }

      return false;
    } catch {
      return false;
    }
  }
}

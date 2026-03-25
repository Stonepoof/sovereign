// ─── Image Service Factory (Sovereign) ──────────────────────────────────────
// Priority: Local -> RunPod -> Mock
// Uses local server for development, RunPod for production

import { getAIConfig, isImageGenEnabled } from '../../config/ai-config';
import { IRunPodClient, RunPodClient, MockRunPodClient } from './runpod-client';
import { LocalImageClient } from './local-image-client';

let _instance: IRunPodClient | null = null;

export async function getImageService(): Promise<IRunPodClient> {
  if (_instance) return _instance;

  // Priority 1: Try local server first (development)
  const localClient = new LocalImageClient();
  const isLocalHealthy = await localClient.isHealthy();

  if (isLocalHealthy) {
    console.log('[ImageService] Using local image generation server');
    _instance = localClient;
    return _instance;
  }

  // Priority 2: Try RunPod (production)
  if (isImageGenEnabled()) {
    const config = getAIConfig();
    console.log('[ImageService] Using RunPod image generation');
    _instance = new RunPodClient(config.RUNPOD_API_KEY, config.RUNPOD_ENDPOINT_ID);
    return _instance;
  }

  // Priority 3: Fallback to mock
  console.log('[ImageService] Using mock image generation (no services available)');
  _instance = new MockRunPodClient();
  return _instance;
}

// Synchronous version for compatibility (tries local then falls back)
export function getImageServiceSync(): IRunPodClient {
  if (_instance) return _instance;

  // For sync, we can't wait for health check, so try RunPod first if configured
  if (isImageGenEnabled()) {
    const config = getAIConfig();
    _instance = new RunPodClient(config.RUNPOD_API_KEY, config.RUNPOD_ENDPOINT_ID);
  } else {
    _instance = new LocalImageClient();
  }

  return _instance;
}

/** Reset cached instance (for testing or config changes) */
export function resetImageService(): void {
  _instance = null;
}

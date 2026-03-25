// ─── AI Service Configuration ─────────────────────────────────────────────
// Centralized config for all AI service API keys and endpoints.
// Reads from Expo Constants (via app.config.ts extras).
// Falls back to empty strings — service factory returns mocks if no keys.

import Constants from 'expo-constants';

export interface AIConfig {
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  RUNPOD_API_KEY: string;
  RUNPOD_ENDPOINT_ID: string;
}

let _cachedConfig: AIConfig | null = null;

export function getAIConfig(): AIConfig {
  if (_cachedConfig) return _cachedConfig;

  const extra = Constants.expoConfig?.extra ?? {};

  _cachedConfig = {
    OPENAI_API_KEY: extra.OPENAI_API_KEY ?? '',
    ANTHROPIC_API_KEY: extra.ANTHROPIC_API_KEY ?? '',
    RUNPOD_API_KEY: extra.RUNPOD_API_KEY ?? '',
    RUNPOD_ENDPOINT_ID: extra.RUNPOD_ENDPOINT_ID ?? '',
  };

  return _cachedConfig;
}

/** Validates that an API key is present and looks real (not a placeholder) */
export function isValidApiKey(key: string | undefined): boolean {
  return !!key && key.length > 10 && !key.startsWith('sk-test') && key !== 'your-key-here';
}

/** Returns true if at least one LLM API key is configured */
export function isLLMEnabled(): boolean {
  const config = getAIConfig();
  return isValidApiKey(config.OPENAI_API_KEY) || isValidApiKey(config.ANTHROPIC_API_KEY);
}

/** Returns true if RunPod image generation is configured */
export function isImageGenEnabled(): boolean {
  const config = getAIConfig();
  return isValidApiKey(config.RUNPOD_API_KEY) && !!(config.RUNPOD_ENDPOINT_ID);
}

/** Returns true if any AI service is available */
export function isAIEnabled(): boolean {
  return isLLMEnabled() || isImageGenEnabled();
}

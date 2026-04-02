import type { LLMConfig, LLMClient, FactCheckConfig } from '../types.js';
import { AISdkClient } from './ai-sdk-client.js';

export function createLLMClient(
  config: LLMConfig,
  apiKey: string,
  factCheckConfig: FactCheckConfig
): LLMClient {
  return new AISdkClient(config, apiKey, factCheckConfig);
}

export { AISdkClient } from './ai-sdk-client.js';

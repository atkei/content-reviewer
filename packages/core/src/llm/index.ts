import type { LLMConfig, LLMClient } from '../types.js';
import { AISdkClient } from './ai-sdk-client.js';

export function createLLMClient(config: LLMConfig, apiKey: string): LLMClient {
  return new AISdkClient(config, apiKey);
}

export { AISdkClient } from './ai-sdk-client.js';

import type { LLMProvider } from '../../types.js';
import { UnsupportedProviderError } from '../../errors.js';
import type { ProviderAdapter } from './types.js';
import { anthropicAdapter } from './anthropic.js';
import { googleAdapter } from './google.js';
import { openAIAdapter } from './openai.js';

export function getProviderAdapter(provider: LLMProvider): ProviderAdapter {
  switch (provider) {
    case 'openai':
      return openAIAdapter;
    case 'anthropic':
      return anthropicAdapter;
    case 'google':
      return googleAdapter;
    default:
      throw new UnsupportedProviderError(provider as string);
  }
}

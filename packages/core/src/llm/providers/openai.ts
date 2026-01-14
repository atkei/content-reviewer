import { createOpenAI } from '@ai-sdk/openai';
import type { ProviderAdapter } from './types.js';

export const openAIAdapter: ProviderAdapter = {
  createModel: (apiKey, model) => {
    const openai = createOpenAI({ apiKey });
    return openai(model);
  },
  createTools: (apiKey, factCheckConfig) => {
    if (!factCheckConfig.enabled) {
      return undefined;
    }

    const openai = createOpenAI({ apiKey });
    const location = factCheckConfig.userLocation
      ? { type: 'approximate' as const, ...factCheckConfig.userLocation }
      : undefined;

    return {
      web_search: openai.tools.webSearch({
        userLocation: location,
      }),
    };
  },
};

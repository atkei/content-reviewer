import { createAnthropic } from '@ai-sdk/anthropic';
import type { ProviderAdapter } from './types.js';

export const anthropicAdapter: ProviderAdapter = {
  createModel: (apiKey, model) => {
    const anthropic = createAnthropic({ apiKey });
    return anthropic(model);
  },
  createTools: (apiKey, factCheckConfig) => {
    if (!factCheckConfig.enabled) {
      return undefined;
    }

    const anthropic = createAnthropic({ apiKey });
    const location = factCheckConfig.userLocation
      ? { type: 'approximate' as const, ...factCheckConfig.userLocation }
      : undefined;

    return {
      web_search: anthropic.tools.webSearch_20250305({
        userLocation: location,
      }),
    };
  },
};

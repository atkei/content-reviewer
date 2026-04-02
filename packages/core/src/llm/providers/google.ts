import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { ProviderAdapter } from './types.js';

export const googleAdapter: ProviderAdapter = {
  createModel: (apiKey, model) => {
    const google = createGoogleGenerativeAI({ apiKey });
    return google(model);
  },
  createTools: (apiKey, factCheckConfig) => {
    if (!factCheckConfig.enabled) {
      return undefined;
    }

    const google = createGoogleGenerativeAI({ apiKey });
    return {
      google_search: google.tools.googleSearch({}),
    };
  },
};

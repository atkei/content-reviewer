import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LLMClient, LLMConfig } from '../types.js';
import { reviewResponseSchema, type ReviewResponseSchema } from '../schemas.js';
import { ContentReviewerError, LLMError, UnsupportedProviderError } from '../errors.js';

export class AISdkClient implements LLMClient {
  constructor(
    private readonly config: LLMConfig,
    private readonly apiKey: string
  ) {}

  async generateReview(systemPrompt: string, userPrompt: string): Promise<ReviewResponseSchema> {
    try {
      const model = this.createModel();

      const { object } = await generateObject({
        model,
        schema: reviewResponseSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });

      return object;
    } catch (error) {
      if (error instanceof ContentReviewerError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new LLMError(`AI SDK request failed: ${error.message}`, error);
      }
      throw new LLMError('AI SDK request failed with unknown error', error);
    }
  }

  private createModel() {
    const { provider, model } = this.config;

    switch (provider) {
      case 'openai': {
        const openai = createOpenAI({
          apiKey: this.apiKey,
        });
        return openai(model);
      }
      case 'anthropic': {
        const anthropic = createAnthropic({
          apiKey: this.apiKey,
        });
        return anthropic(model);
      }
      case 'google': {
        const google = createGoogleGenerativeAI({
          apiKey: this.apiKey,
        });
        return google(model);
      }
      default:
        throw new UnsupportedProviderError(provider as string);
    }
  }
}

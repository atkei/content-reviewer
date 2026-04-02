import { generateObject } from 'ai';
import type { FactCheckConfig, LLMClient, LLMConfig, LLMResponse } from '../types.js';
import type { FactCheckClaim } from '../fact-check/schema.js';
import { reviewResponseSchema } from '../review/schemas.js';
import { ContentReviewerError, LLMError, MissingFactCheckToolsError } from '../errors.js';
import { generateFactCheckPlan } from '../fact-check/plan.js';
import { runFactCheck } from '../fact-check/run.js';
import { getProviderAdapter } from './providers/index.js';
import type { AISdkModel, ProviderAdapter } from './providers/types.js';

export class AISdkClient implements LLMClient {
  private providerAdapter: ProviderAdapter | undefined;

  constructor(
    private readonly config: LLMConfig,
    private readonly apiKey: string,
    private readonly factCheckConfig: FactCheckConfig
  ) {}

  async generateReview(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    try {
      const model = this.createModel();
      const { object } = await generateObject({
        model,
        schema: reviewResponseSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });

      return {
        issues: object.issues,
      };
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

  supportsFactCheck(): boolean {
    return Boolean(this.createFactCheckTools());
  }

  async generateFactCheckPlan(
    userPrompt: string,
    factCheckInstruction: string
  ): Promise<FactCheckClaim[]> {
    try {
      const model = this.createModel();
      return await generateFactCheckPlan(model, userPrompt, factCheckInstruction);
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

  async runFactCheck(systemPrompt: string, prompt: string): Promise<string> {
    try {
      const tools = this.createFactCheckTools();
      if (!tools) {
        throw new MissingFactCheckToolsError();
      }
      const model = this.createModel();
      return await runFactCheck(model, tools, systemPrompt, prompt);
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

  private getProviderAdapter(): ProviderAdapter {
    if (!this.providerAdapter) {
      this.providerAdapter = getProviderAdapter(this.config.provider);
    }
    return this.providerAdapter;
  }

  private createModel(): AISdkModel {
    const providerAdapter = this.getProviderAdapter();
    return providerAdapter.createModel(this.apiKey, this.config.model);
  }

  private createFactCheckTools() {
    const providerAdapter = this.getProviderAdapter();
    return providerAdapter.createTools(this.apiKey, this.factCheckConfig);
  }
}

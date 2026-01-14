import { generateObject, type ToolSet } from 'ai';
import type { LLMClient, LLMConfig, LLMResponse, FactCheckConfig } from '../types.js';
import { reviewResponseSchema } from '../schemas.js';
import { ContentReviewerError, LLMError, MissingFactCheckInstructionError } from '../errors.js';
import { generateFactCheckPlan } from './fact-check-plan.js';
import { runFactCheck } from './fact-check-runner.js';
import {
  buildFactCheckPrompt,
  buildReviewPromptWithFactCheck,
} from './prompts/fact-check-prompts.js';
import { getProviderAdapter } from './providers/index.js';
import type { AISdkModel } from './providers/types.js';

export class AISdkClient implements LLMClient {
  constructor(
    private readonly config: LLMConfig,
    private readonly apiKey: string,
    private readonly factCheckConfig: FactCheckConfig
  ) {}

  async generateReview(
    systemPrompt: string,
    userPrompt: string,
    factCheckInstruction?: string
  ): Promise<LLMResponse> {
    try {
      const providerAdapter = getProviderAdapter(this.config.provider);
      const model = providerAdapter.createModel(this.apiKey, this.config.model);

      if (this.factCheckConfig.enabled) {
        if (!factCheckInstruction) {
          throw new MissingFactCheckInstructionError();
        }
        const tools = providerAdapter.createTools(this.apiKey, this.factCheckConfig);
        return await this.generateWithFactCheck(
          model,
          tools,
          systemPrompt,
          userPrompt,
          factCheckInstruction
        );
      }

      return await this.generateWithoutTools(model, systemPrompt, userPrompt);
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

  private async generateWithoutTools(
    model: AISdkModel,
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
    const { object } = await generateObject({
      model,
      schema: reviewResponseSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return {
      issues: object.issues,
    };
  }

  private async generateWithFactCheck(
    model: AISdkModel,
    tools: ToolSet | undefined,
    reviewSystemPrompt: string,
    userPrompt: string,
    factCheckInstruction: string
  ): Promise<LLMResponse> {
    if (!tools) {
      return await this.generateWithoutTools(model, reviewSystemPrompt, userPrompt);
    }

    const asOf = this.getAsOfDate();
    const claims = await generateFactCheckPlan(model, userPrompt, factCheckInstruction);

    if (claims.length === 0) {
      return await this.generateWithoutTools(model, reviewSystemPrompt, userPrompt);
    }

    const { system, prompt } = buildFactCheckPrompt(factCheckInstruction, claims, userPrompt, asOf);

    const factCheckResult = await runFactCheck(model, tools, system, prompt);

    const enrichedPrompt = buildReviewPromptWithFactCheck(userPrompt, factCheckResult, asOf);
    const { object } = await generateObject({
      model,
      schema: reviewResponseSchema,
      system: reviewSystemPrompt,
      prompt: enrichedPrompt,
    });

    return {
      issues: object.issues,
    };
  }

  private getAsOfDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}

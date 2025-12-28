import type { ReviewConfig, Language, LLMConfig, LLMProvider, IssueSeverity } from './types.js';
import { ENV_VARS } from './constants.js';
import { MissingApiKeyError } from './errors.js';
import { SEVERITY_LEVELS } from './filter.js';

export type ReviewConfigInput = Readonly<{
  instruction?: string;
  language?: Language;
  llm?: Partial<LLMConfig>;
  severityLevel?: IssueSeverity;
}>;

export const PROVIDER_DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4.1-mini',
  anthropic: 'claude-haiku-4-5',
  google: 'gemini-2.5-flash',
};

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'openai',
  model: PROVIDER_DEFAULT_MODELS.openai,
};

export const DEFAULT_CONFIG: ReviewConfig = {
  language: 'en',
  llm: DEFAULT_LLM_CONFIG,
};

export function createReviewConfig(input: ReviewConfigInput = {}): ReviewConfig {
  const provider = input.llm?.provider ?? DEFAULT_LLM_CONFIG.provider;
  const model = input.llm?.model ?? PROVIDER_DEFAULT_MODELS[provider];

  return {
    instruction: input.instruction,
    language: input.language ?? DEFAULT_CONFIG.language,
    llm: {
      provider,
      model,
      apiKey: input.llm?.apiKey,
    },
    severityLevel: input.severityLevel,
  };
}

export function resolveApiKey(config: ReviewConfig): string {
  if (config.llm.apiKey) {
    return config.llm.apiKey;
  }

  const envVarMap: Record<LLMProvider, string> = {
    openai: ENV_VARS.OPENAI_API_KEY,
    anthropic: ENV_VARS.ANTHROPIC_API_KEY,
    google: ENV_VARS.GOOGLE_API_KEY,
  };

  const envVarName = envVarMap[config.llm.provider];
  const envKey = process.env[envVarName];

  if (!envKey) {
    throw new MissingApiKeyError(envVarName);
  }

  return envKey;
}

export function validateConfig(config: ReviewConfig): void {
  if (!config.language) {
    throw new Error('language is required');
  }

  const validLanguages: Language[] = ['ja', 'en'];
  if (!validLanguages.includes(config.language)) {
    throw new Error(
      `Invalid language: ${config.language}. Supported languages are: ${validLanguages.join(', ')}`
    );
  }

  if (!config.llm.provider) {
    throw new Error('LLM provider is required');
  }

  if (!config.llm.model) {
    throw new Error('LLM model is required');
  }

  if (config.severityLevel !== undefined && !(config.severityLevel in SEVERITY_LEVELS)) {
    const validLevels = Object.keys(SEVERITY_LEVELS).join(', ');
    throw new Error(
      `Invalid severity level: ${config.severityLevel}. Valid levels are: ${validLevels}`
    );
  }
}

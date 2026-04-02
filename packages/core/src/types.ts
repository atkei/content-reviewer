import type { IssueSeverity } from './severity.js';
import type { FactCheckClaim } from './fact-check/schema.js';

export type { IssueSeverity };

export type Document = Readonly<{
  rawContent: string;
  source: string;
}>;

export type Language = 'ja' | 'en';

export type LLMProvider = 'openai' | 'anthropic' | 'google';

export type LLMConfig = Readonly<{
  provider: LLMProvider;
  model: string;
  apiKey?: string;
}>;

export type FactCheckConfig = Readonly<{
  enabled: boolean;
  userLocation?: Readonly<{
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  }>;
  instruction?: string;
}>;

export type LLMResponse = Readonly<{
  issues: ReviewIssue[];
}>;

export interface LLMClient {
  generateReview(systemPrompt: string, userPrompt: string): Promise<LLMResponse>;
  supportsFactCheck(): boolean;
  generateFactCheckPlan(
    userPrompt: string,
    factCheckInstruction: string
  ): Promise<FactCheckClaim[]>;
  runFactCheck(systemPrompt: string, prompt: string): Promise<string>;
}

export type ReviewConfig = Readonly<{
  instruction?: string;
  language: Language;
  llm: LLMConfig;
  severityLevel?: IssueSeverity;
  factCheck: FactCheckConfig;
}>;

export type ReviewIssue = Readonly<{
  severity: IssueSeverity;
  message: string;
  matchText?: string;
  lineNumber?: number;
  suggestion?: string;
  source?: Readonly<{
    url: string;
    title?: string;
  }>;
}>;

export type ReviewResult = Readonly<{
  source: string;
  issues: ReviewIssue[];
  reviewedAt: Date;
}>;

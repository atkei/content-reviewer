import type { ReviewResponseSchema } from './schemas.js';
import type { IssueSeverity } from './severity.js';

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

export interface LLMClient {
  generateReview(systemPrompt: string, userPrompt: string): Promise<ReviewResponseSchema>;
}

export type ReviewConfig = Readonly<{
  instruction?: string;
  language: Language;
  llm: LLMConfig;
  severityLevel?: IssueSeverity;
}>;

export type ReviewIssue = Readonly<{
  severity: IssueSeverity;
  message: string;
  matchText?: string;
  lineNumber?: number;
  suggestion?: string;
}>;

export type ReviewResult = Readonly<{
  source: string;
  issues: ReviewIssue[];
  reviewedAt: Date;
}>;

import type { Document, ReviewConfig, ReviewResult } from './types.js';
import { createLLMClient } from './llm/index.js';
import { resolveApiKey } from './config.js';
import { getLanguagePrompts } from './prompts.js';
import { filterIssuesBySeverity } from './filter.js';

export class ContentReviewer {
  constructor(private readonly config: ReviewConfig) {}

  async review(document: Document): Promise<ReviewResult> {
    const llmResult = await this.runLLMReview(document);

    const issues = this.config.severityLevel
      ? filterIssuesBySeverity(llmResult.issues, this.config.severityLevel)
      : llmResult.issues;

    return {
      source: document.source,
      issues,
      reviewedAt: new Date(),
    };
  }

  private async runLLMReview(document: Document) {
    const apiKey = resolveApiKey(this.config);
    const llmClient = createLLMClient(this.config.llm, apiKey);

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(document);
    const reviewData = await llmClient.generateReview(systemPrompt, userPrompt);

    const issues = reviewData.issues.map((issue) => ({
      ...issue,
      lineNumber: issue.matchText
        ? this.findFirstMatchingLineNumber(document.rawContent, issue.matchText)
        : undefined,
    }));

    return { issues };
  }

  private buildSystemPrompt(): string {
    const { instruction, language } = this.config;

    const { buildSystemPrompt } = getLanguagePrompts(language);
    return buildSystemPrompt({ instruction });
  }

  private buildUserPrompt(document: Document): string {
    const { language } = this.config;

    const { buildUserPrompt } = getLanguagePrompts(language);
    const prompt = buildUserPrompt();

    return prompt + document.rawContent;
  }

  private findFirstMatchingLineNumber(rawContent: string, matchText: string): number | undefined {
    const index = rawContent.indexOf(matchText);

    if (index !== -1) {
      const beforeMatch = rawContent.substring(0, index);
      const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
      return lineNumber;
    }

    const lines = rawContent.split('\n');
    const trimmedMatchText = matchText.trim();

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(trimmedMatchText)) {
        return i + 1;
      }
    }

    return undefined;
  }
}

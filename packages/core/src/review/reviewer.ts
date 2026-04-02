import type { Document, ReviewConfig, ReviewResult } from '../types.js';
import { createLLMClient } from '../llm/index.js';
import { resolveApiKey } from '../config.js';
import { getLanguagePrompts } from './prompts.js';
import { filterIssuesBySeverity } from '../filter.js';
import {
  DEFAULT_FACT_CHECK_INSTRUCTION_EN,
  DEFAULT_FACT_CHECK_INSTRUCTION_JA,
} from '../default-instructions.js';
import { buildFactCheckPrompt, buildReviewPromptWithFactCheck } from '../fact-check/prompts.js';

export class ContentReviewer {
  constructor(private readonly config: ReviewConfig) {}

  async review(document: Document): Promise<ReviewResult> {
    const reviewedAt = new Date();
    const llmResult = await this.runLLMReview(document, reviewedAt);

    const issues = this.config.severityLevel
      ? filterIssuesBySeverity(llmResult.issues, this.config.severityLevel)
      : llmResult.issues;

    return {
      source: document.source,
      issues,
      reviewedAt,
    };
  }

  private async runLLMReview(document: Document, reviewedAt: Date) {
    const apiKey = resolveApiKey(this.config);
    const llmClient = createLLMClient(this.config.llm, apiKey, this.config.factCheck);

    const asOf = reviewedAt.toISOString().slice(0, 10);
    const userPrompt = this.buildUserPrompt(document);
    let factCheckApplied = false;
    let reviewPrompt = userPrompt;

    if (this.config.factCheck.enabled) {
      const factCheckInstruction = this.buildFactCheckInstruction(asOf);
      if (factCheckInstruction && llmClient.supportsFactCheck()) {
        const claims = await llmClient.generateFactCheckPlan(userPrompt, factCheckInstruction);
        if (claims.length > 0) {
          const { system, prompt } = buildFactCheckPrompt(
            factCheckInstruction,
            claims,
            userPrompt,
            asOf
          );
          const factCheckResult = await llmClient.runFactCheck(system, prompt);
          reviewPrompt = buildReviewPromptWithFactCheck(userPrompt, factCheckResult, asOf);
          factCheckApplied = true;
        }
      }
    }

    const systemPrompt = this.buildSystemPrompt(asOf, factCheckApplied);
    const reviewData = await llmClient.generateReview(systemPrompt, reviewPrompt);

    const issues = reviewData.issues.map((issue) => ({
      ...issue,
      lineNumber: issue.matchText
        ? this.findFirstMatchingLineNumber(document.rawContent, issue.matchText)
        : undefined,
    }));

    return { issues };
  }

  private buildSystemPrompt(asOf: string, factCheckApplied: boolean): string {
    const { instruction, language } = this.config;

    const { buildSystemPrompt } = getLanguagePrompts(language);
    return buildSystemPrompt({
      instruction,
      factCheckEnabled: factCheckApplied,
      asOf,
    });
  }

  private buildUserPrompt(document: Document): string {
    const { language } = this.config;

    const { buildUserPrompt } = getLanguagePrompts(language);
    const prompt = buildUserPrompt();

    return prompt + document.rawContent;
  }

  private buildFactCheckInstruction(asOf: string): string | undefined {
    if (!this.config.factCheck.enabled) {
      return undefined;
    }

    const { language, factCheck } = this.config;

    // Use custom instruction if provided, otherwise use default
    const baseInstruction = factCheck.instruction
      ? factCheck.instruction
      : language === 'ja'
        ? DEFAULT_FACT_CHECK_INSTRUCTION_JA
        : DEFAULT_FACT_CHECK_INSTRUCTION_EN;

    const rules =
      language === 'ja'
        ? `追加ルール:
- 参照日時は ${asOf} です。「現在」や「最新」に言及する場合はこの日付を明記してください。
- 本文に存在する情報を「未記載」として指摘しないでください。`
        : `Additional rules:
- Reference date is ${asOf}. If you mention "current" or "latest", state it as of this date.
- Do not claim something is missing when it appears in the content.`;

    return `${baseInstruction.trimEnd()}

${rules}`;
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

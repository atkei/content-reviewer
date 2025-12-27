import { describe, it, expect, vi } from 'vitest';
import { ContentReviewer } from '../../reviewer.js';
import type { Document, ReviewConfig } from '../../types.js';

// Mock LLM client
vi.mock('../../llm/index.js', () => ({
  createLLMClient: () => ({
    generateReview: vi.fn().mockResolvedValue({
      issues: [
        {
          severity: 'warning',
          message: 'Consider updating to the latest version',
          matchText: 'Node.js 12',
        },
      ],
      summary: 'Good overall, but some improvements needed.',
    }),
  }),
}));

describe('ContentReviewer (Integration)', () => {
  const mockDocument: Document = {
    rawContent: '# Test\n\nNode.js 12 is used.',
    source: 'test.md',
  };

  it('should use LLM summary', async () => {
    const configJa: ReviewConfig = {
      instruction: 'test',
      language: 'ja',
      llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'test-key' },
    };

    const reviewerJa = new ContentReviewer(configJa);
    const resultJa = await reviewerJa.review(mockDocument);

    // Should use LLM-generated summary
    expect(resultJa.summary).toBe('Good overall, but some improvements needed.');

    // Mock config
    const configEn: ReviewConfig = {
      instruction: '# Test Instructions',
      language: 'en',
      llm: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'test-key',
      },
    };

    const reviewerEn = new ContentReviewer(configEn);
    const resultEn = await reviewerEn.review(mockDocument);

    expect(resultEn.summary).toBe('Good overall, but some improvements needed.');
  });

  it('should perform LLM-based review', async () => {
    const config: ReviewConfig = {
      language: 'ja',
      llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'test-key' },
    };

    const reviewer = new ContentReviewer(config);
    const result = await reviewer.review(mockDocument);

    // Should have LLM issues
    expect(result.issues.length).toBeGreaterThan(0);

    // Check structure
    expect(result).toHaveProperty('source', 'test.md');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('reviewedAt');
  });

  it('should map matchText to line numbers', async () => {
    const config: ReviewConfig = {
      language: 'ja',
      llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'test-key' },
    };

    const reviewer = new ContentReviewer(config);
    const result = await reviewer.review(mockDocument);

    const issuesWithLineNumbers = result.issues.filter((i) => i.lineNumber !== undefined);
    expect(issuesWithLineNumbers.length).toBeGreaterThan(0);
  });

  it('should filter issues by severityLevel when configured', async () => {
    // Mock to return multiple severity levels
    vi.mock('../../llm/index.js', () => ({
      createLLMClient: () => ({
        generateReview: vi.fn().mockResolvedValue({
          issues: [
            { severity: 'error', message: 'Critical error', matchText: 'error text' },
            { severity: 'warning', message: 'Warning message', matchText: 'warning text' },
            { severity: 'suggestion', message: 'Suggestion message', matchText: 'suggestion text' },
          ],
          summary: 'Mixed severity issues found.',
        }),
      }),
    }));

    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'test-key' },
      severityLevel: 'warning',
    };

    const reviewer = new ContentReviewer(config);
    const result = await reviewer.review(mockDocument);

    // Should only include warning and error
    expect(result.issues).toHaveLength(2);
    expect(result.issues.some((i) => i.severity === 'suggestion')).toBe(false);
    expect(result.issues.some((i) => i.severity === 'warning')).toBe(true);
    expect(result.issues.some((i) => i.severity === 'error')).toBe(true);
  });

  it('should not filter issues when severityLevel is undefined', async () => {
    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'test-key' },
      // severityLevel not set
    };

    const reviewer = new ContentReviewer(config);
    const result = await reviewer.review(mockDocument);

    // Should include all issues from mock
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should generate summary based on filtered issues', async () => {
    vi.mock('../../llm/index.js', () => ({
      createLLMClient: () => ({
        generateReview: vi.fn().mockResolvedValue({
          issues: [
            { severity: 'error', message: 'Error 1' },
            { severity: 'error', message: 'Error 2' },
            { severity: 'suggestion', message: 'Suggestion 1' },
          ],
          summary: undefined, // Force local summary generation
        }),
      }),
    }));

    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'test-key' },
      severityLevel: 'error',
    };

    const reviewer = new ContentReviewer(config);
    const result = await reviewer.review(mockDocument);

    // Summary should reflect only filtered issues (2 errors)
    expect(result.issues).toHaveLength(2);
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('should handle severityLevel error filtering', async () => {
    vi.mock('../../llm/index.js', () => ({
      createLLMClient: () => ({
        generateReview: vi.fn().mockResolvedValue({
          issues: [
            { severity: 'error', message: 'Error only' },
            { severity: 'warning', message: 'Should be filtered' },
          ],
          summary: 'Test summary',
        }),
      }),
    }));

    const config: ReviewConfig = {
      language: 'ja',
      llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'test-key' },
      severityLevel: 'error',
    };

    const reviewer = new ContentReviewer(config);
    const result = await reviewer.review(mockDocument);

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('error');
  });
});

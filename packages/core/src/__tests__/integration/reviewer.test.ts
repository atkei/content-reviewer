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
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentReviewer } from '../../review/reviewer.js';
import type { Document, ReviewConfig } from '../../types.js';

const mockGenerateReview = vi.fn();
const mockSupportsFactCheck = vi.fn();
const mockGenerateFactCheckPlan = vi.fn();
const mockRunFactCheck = vi.fn();

vi.mock('../../llm/index.js', () => ({
  createLLMClient: () => ({
    generateReview: mockGenerateReview,
    supportsFactCheck: mockSupportsFactCheck,
    generateFactCheckPlan: mockGenerateFactCheckPlan,
    runFactCheck: mockRunFactCheck,
  }),
}));

describe('Fact-Check Integration', () => {
  const mockDocument: Document = {
    rawContent: '# Test\n\nNode.js 20 is the latest LTS version.',
    source: 'test.md',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateReview.mockResolvedValue({
      issues: [],
    });
  });

  it('should perform fact-check when enabled and claims exist', async () => {
    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test-key' },
      factCheck: { enabled: true },
    };

    mockSupportsFactCheck.mockReturnValue(true);
    mockGenerateFactCheckPlan.mockResolvedValue([
      { id: 'C1', text: 'Node.js 20 is the latest LTS version' },
    ]);
    mockRunFactCheck.mockResolvedValue('Claim C1: verified');

    const reviewer = new ContentReviewer(config);
    await reviewer.review(mockDocument);

    expect(mockSupportsFactCheck).toHaveBeenCalledTimes(1);
    expect(mockGenerateFactCheckPlan).toHaveBeenCalledTimes(1);
    expect(mockRunFactCheck).toHaveBeenCalledTimes(1);

    const reviewCall = mockGenerateReview.mock.calls[0];
    const userPrompt = reviewCall[1];
    expect(userPrompt).toContain('Fact-Check Results');
    expect(userPrompt).toContain('Claim C1: verified');
  });

  it('should skip fact-check when no claims are found', async () => {
    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test-key' },
      factCheck: { enabled: true },
    };

    mockSupportsFactCheck.mockReturnValue(true);
    mockGenerateFactCheckPlan.mockResolvedValue([]);

    const reviewer = new ContentReviewer(config);
    await reviewer.review(mockDocument);

    expect(mockSupportsFactCheck).toHaveBeenCalledTimes(1);
    expect(mockGenerateFactCheckPlan).toHaveBeenCalledTimes(1);
    expect(mockRunFactCheck).not.toHaveBeenCalled();

    const reviewCall = mockGenerateReview.mock.calls[0];
    const userPrompt = reviewCall[1];
    expect(userPrompt).not.toContain('Fact-Check Results');
  });

  it('should skip fact-check when disabled', async () => {
    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test-key' },
      factCheck: { enabled: false },
    };

    const reviewer = new ContentReviewer(config);
    await reviewer.review(mockDocument);

    expect(mockSupportsFactCheck).not.toHaveBeenCalled();
    expect(mockGenerateFactCheckPlan).not.toHaveBeenCalled();
    expect(mockRunFactCheck).not.toHaveBeenCalled();
  });

  it('should skip fact-check when provider does not support it', async () => {
    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'openai', model: 'gpt-4o', apiKey: 'test-key' },
      factCheck: { enabled: true },
    };

    mockSupportsFactCheck.mockReturnValue(false);

    const reviewer = new ContentReviewer(config);
    await reviewer.review(mockDocument);

    expect(mockSupportsFactCheck).toHaveBeenCalledTimes(1);
    expect(mockGenerateFactCheckPlan).not.toHaveBeenCalled();
    expect(mockRunFactCheck).not.toHaveBeenCalled();
  });

  it('should include reference date in fact-check instruction', async () => {
    const config: ReviewConfig = {
      language: 'ja',
      llm: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test-key' },
      factCheck: { enabled: true },
    };

    mockSupportsFactCheck.mockReturnValue(true);
    mockGenerateFactCheckPlan.mockResolvedValue([{ id: 'C1', text: 'test claim' }]);
    mockRunFactCheck.mockResolvedValue('result');

    const reviewer = new ContentReviewer(config);
    await reviewer.review(mockDocument);

    const planCall = mockGenerateFactCheckPlan.mock.calls[0];
    const factCheckInstruction = planCall[1];
    expect(factCheckInstruction).toContain('参照日時は');

    const runCall = mockRunFactCheck.mock.calls[0];
    const systemPrompt = runCall[0];
    expect(systemPrompt).toMatch(/Reference date: \d{4}-\d{2}-\d{2}/);
  });

  it('should use custom fact-check instruction when provided', async () => {
    const customInstruction = 'Custom verification rules';
    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test-key' },
      factCheck: {
        enabled: true,
        instruction: customInstruction,
      },
    };

    mockSupportsFactCheck.mockReturnValue(true);
    mockGenerateFactCheckPlan.mockResolvedValue([{ id: 'C1', text: 'test' }]);
    mockRunFactCheck.mockResolvedValue('result');

    const reviewer = new ContentReviewer(config);
    await reviewer.review(mockDocument);

    const planCall = mockGenerateFactCheckPlan.mock.calls[0];
    const factCheckInstruction = planCall[1];
    expect(factCheckInstruction).toContain(customInstruction);
  });

  it('should handle fact-check with user location', async () => {
    const config: ReviewConfig = {
      language: 'en',
      llm: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test-key' },
      factCheck: {
        enabled: true,
        userLocation: {
          country: 'US',
          city: 'San Francisco',
          region: 'California',
          timezone: 'America/Los_Angeles',
        },
      },
    };

    mockSupportsFactCheck.mockReturnValue(true);
    mockGenerateFactCheckPlan.mockResolvedValue([{ id: 'C1', text: 'test' }]);
    mockRunFactCheck.mockResolvedValue('result');

    const reviewer = new ContentReviewer(config);
    const result = await reviewer.review(mockDocument);

    expect(result).toBeDefined();
    expect(mockRunFactCheck).toHaveBeenCalledTimes(1);
  });
});

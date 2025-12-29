import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AISdkClient } from '../../llm/ai-sdk-client.js';
import { LLMError, UnsupportedProviderError } from '../../errors.js';
import type { LLMConfig } from '../../types.js';

// Mock the ai-sdk functions
const mockGenerateObject = vi.fn();
const mockOpenAI = vi.fn();
const mockAnthropic = vi.fn();
const mockGoogle = vi.fn();

vi.mock('ai', () => ({
  generateObject: (...args: any[]) => mockGenerateObject(...args),
}));

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: () => mockOpenAI,
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: () => mockAnthropic,
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: () => mockGoogle,
}));

describe('AISdkClient', () => {
  const mockConfig: LLMConfig = {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: 'test-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default success mock
    mockGenerateObject.mockResolvedValue({
      object: { issues: [] },
    });
    mockOpenAI.mockReturnValue({}); // Mock model instance
  });

  it('should throw UnsupportedProviderError for unknown provider', async () => {
    const badConfig = { ...mockConfig, provider: 'unknown-provider' as any };
    const client = new AISdkClient(badConfig, 'key');

    await expect(client.generateReview('sys', 'user')).rejects.toThrow(UnsupportedProviderError);
  });

  it('should throw LLMError when AI SDK fails', async () => {
    const error = new Error('API Error');
    mockGenerateObject.mockRejectedValue(error);

    const client = new AISdkClient(mockConfig, 'key');

    await expect(client.generateReview('sys', 'user')).rejects.toThrow(LLMError);
    await expect(client.generateReview('sys', 'user')).rejects.toThrow(
      'AI SDK request failed: API Error'
    );
  });

  it('should wrap unknown errors in LLMError', async () => {
    mockGenerateObject.mockRejectedValue('Unknown string error');

    const client = new AISdkClient(mockConfig, 'key');

    await expect(client.generateReview('sys', 'user')).rejects.toThrow(LLMError);
    await expect(client.generateReview('sys', 'user')).rejects.toThrow(
      'AI SDK request failed with unknown error'
    );
  });
});

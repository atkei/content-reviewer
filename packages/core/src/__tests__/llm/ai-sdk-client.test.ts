import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AISdkClient } from '../../llm/ai-sdk-client.js';
import { LLMError, UnsupportedProviderError, MissingFactCheckToolsError } from '../../errors.js';
import { DEFAULT_FACT_CHECK_CONFIG } from '../../config.js';
import type { LLMConfig } from '../../types.js';

// Mock the ai-sdk functions
const mockGenerateObject = vi.fn();
const mockGenerateText = vi.fn();
const mockOpenAI = vi.fn();
const mockAnthropic = vi.fn();
const mockAnthropicTools = vi.fn();
const mockGoogle = vi.fn();

vi.mock('ai', () => ({
  generateObject: (...args: any[]) => mockGenerateObject(...args),
  generateText: (...args: any[]) => mockGenerateText(...args),
}));

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: () => mockOpenAI,
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: () => {
    const instance = mockAnthropic;
    instance.tools = {
      webSearch_20250305: mockAnthropicTools,
    };
    return instance;
  },
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
    const client = new AISdkClient(badConfig, 'key', DEFAULT_FACT_CHECK_CONFIG);

    await expect(client.generateReview('sys', 'user')).rejects.toThrow(UnsupportedProviderError);
  });

  it('should throw LLMError when AI SDK fails', async () => {
    const error = new Error('API Error');
    mockGenerateObject.mockRejectedValue(error);

    const client = new AISdkClient(mockConfig, 'key', DEFAULT_FACT_CHECK_CONFIG);

    await expect(client.generateReview('sys', 'user')).rejects.toThrow(LLMError);
    await expect(client.generateReview('sys', 'user')).rejects.toThrow(
      'AI SDK request failed: API Error'
    );
  });

  it('should wrap unknown errors in LLMError', async () => {
    mockGenerateObject.mockRejectedValue('Unknown string error');

    const client = new AISdkClient(mockConfig, 'key', DEFAULT_FACT_CHECK_CONFIG);

    await expect(client.generateReview('sys', 'user')).rejects.toThrow(LLMError);
    await expect(client.generateReview('sys', 'user')).rejects.toThrow(
      'AI SDK request failed with unknown error'
    );
  });

  describe('Fact-check methods', () => {
    it('should return false for supportsFactCheck when provider has no tools', () => {
      const client = new AISdkClient(mockConfig, 'key', DEFAULT_FACT_CHECK_CONFIG);
      expect(client.supportsFactCheck()).toBe(false);
    });

    it('should return true for supportsFactCheck when anthropic provider is used with fact-check enabled', () => {
      const anthropicConfig: LLMConfig = {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        apiKey: 'test-key',
      };
      mockAnthropicTools.mockReturnValue({ web_search: {} });

      const client = new AISdkClient(anthropicConfig, 'key', { enabled: true });
      expect(client.supportsFactCheck()).toBe(true);
    });

    it('should return empty array when generateFactCheckPlan encounters error', async () => {
      mockGenerateObject.mockRejectedValue(new Error('Plan generation failed'));

      const client = new AISdkClient(mockConfig, 'key', DEFAULT_FACT_CHECK_CONFIG);
      const result = await client.generateFactCheckPlan('content', 'instruction');

      expect(result).toEqual([]);
    });

    it('should return claims when generateFactCheckPlan succeeds', async () => {
      const mockClaims = [
        { id: 'C1', text: 'Claim 1' },
        { id: 'C2', text: 'Claim 2' },
      ];
      mockGenerateObject.mockResolvedValue({
        object: { claims: mockClaims },
      });

      const client = new AISdkClient(mockConfig, 'key', DEFAULT_FACT_CHECK_CONFIG);
      const result = await client.generateFactCheckPlan('content', 'instruction');

      expect(result).toEqual(mockClaims);
    });

    it('should throw MissingFactCheckToolsError when runFactCheck is called without tools', async () => {
      const client = new AISdkClient(mockConfig, 'key', { enabled: false });

      await expect(client.runFactCheck('system', 'prompt')).rejects.toThrow(
        MissingFactCheckToolsError
      );
    });

    it('should successfully run fact-check when tools are available', async () => {
      const anthropicConfig: LLMConfig = {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        apiKey: 'test-key',
      };
      mockAnthropicTools.mockReturnValue({ web_search: {} });
      mockAnthropic.mockReturnValue({});
      mockGenerateText.mockResolvedValue({ text: 'Fact-check result' });

      const client = new AISdkClient(anthropicConfig, 'key', { enabled: true });

      const result = await client.runFactCheck('system', 'prompt');

      expect(result).toBe('Fact-check result');
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'system',
          prompt: 'prompt',
          toolChoice: 'required',
        })
      );
    });

    it('should throw LLMError when runFactCheck fails', async () => {
      const anthropicConfig: LLMConfig = {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        apiKey: 'test-key',
      };
      mockAnthropicTools.mockReturnValue({ web_search: {} });
      mockAnthropic.mockReturnValue({});
      mockGenerateText.mockRejectedValue(new Error('API error'));

      const client = new AISdkClient(anthropicConfig, 'key', { enabled: true });

      await expect(client.runFactCheck('system', 'prompt')).rejects.toThrow(LLMError);
      await expect(client.runFactCheck('system', 'prompt')).rejects.toThrow(
        'AI SDK request failed: API error'
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProviderAdapter } from '../../llm/providers/index.js';
import { UnsupportedProviderError } from '../../errors.js';
import type { LLMProvider, FactCheckConfig } from '../../types.js';

const mockOpenAIInstance = vi.fn();
const mockAnthropicInstance = vi.fn();
const mockGoogleInstance = vi.fn();

const mockOpenAITools = {
  webSearch: vi.fn(),
};

const mockAnthropicTools = {
  webSearch_20250305: vi.fn(),
};

const mockGoogleTools = {
  googleSearch: vi.fn(),
};

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: () => {
    const fn = mockOpenAIInstance;
    fn.tools = mockOpenAITools;
    return fn;
  },
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: () => {
    const fn = mockAnthropicInstance;
    fn.tools = mockAnthropicTools;
    return fn;
  },
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: () => {
    const fn = mockGoogleInstance;
    fn.tools = mockGoogleTools;
    return fn;
  },
}));

describe('Provider Adapters', () => {
  const apiKey = 'test-api-key';
  const model = 'test-model';

  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenAIInstance.mockReturnValue({ name: 'openai-model' });
    mockAnthropicInstance.mockReturnValue({ name: 'anthropic-model' });
    mockGoogleInstance.mockReturnValue({ name: 'google-model' });
  });

  describe('getProviderAdapter', () => {
    it('should return OpenAI adapter for openai provider', () => {
      const adapter = getProviderAdapter('openai');
      expect(adapter).toBeDefined();
      expect(typeof adapter.createModel).toBe('function');
      expect(typeof adapter.createTools).toBe('function');
    });

    it('should return Anthropic adapter for anthropic provider', () => {
      const adapter = getProviderAdapter('anthropic');
      expect(adapter).toBeDefined();
      expect(typeof adapter.createModel).toBe('function');
      expect(typeof adapter.createTools).toBe('function');
    });

    it('should return Google adapter for google provider', () => {
      const adapter = getProviderAdapter('google');
      expect(adapter).toBeDefined();
      expect(typeof adapter.createModel).toBe('function');
      expect(typeof adapter.createTools).toBe('function');
    });

    it('should throw UnsupportedProviderError for unknown provider', () => {
      expect(() => getProviderAdapter('unknown' as LLMProvider)).toThrow(UnsupportedProviderError);
      expect(() => getProviderAdapter('unknown' as LLMProvider)).toThrow(
        'Unsupported provider: unknown'
      );
    });
  });

  describe('OpenAI Adapter', () => {
    const adapter = getProviderAdapter('openai');

    it('should create model with API key', () => {
      const result = adapter.createModel(apiKey, model);

      expect(mockOpenAIInstance).toHaveBeenCalledWith(model);
      expect(result).toEqual({ name: 'openai-model' });
    });

    it('should return undefined when fact-check is disabled', () => {
      const factCheckConfig: FactCheckConfig = { enabled: false };
      const tools = adapter.createTools(apiKey, factCheckConfig);

      expect(tools).toBeUndefined();
    });

    it('should create web search tools when fact-check is enabled', () => {
      const factCheckConfig: FactCheckConfig = { enabled: true };
      mockOpenAITools.webSearch.mockReturnValue({ tool: 'web-search' });

      const tools = adapter.createTools(apiKey, factCheckConfig);

      expect(mockOpenAITools.webSearch).toHaveBeenCalledWith({
        userLocation: undefined,
      });
      expect(tools).toEqual({ web_search: { tool: 'web-search' } });
    });

    it('should include user location when provided', () => {
      const factCheckConfig: FactCheckConfig = {
        enabled: true,
        userLocation: {
          country: 'US',
          city: 'San Francisco',
          region: 'California',
          timezone: 'America/Los_Angeles',
        },
      };
      mockOpenAITools.webSearch.mockReturnValue({ tool: 'web-search' });

      adapter.createTools(apiKey, factCheckConfig);

      expect(mockOpenAITools.webSearch).toHaveBeenCalledWith({
        userLocation: {
          type: 'approximate',
          country: 'US',
          city: 'San Francisco',
          region: 'California',
          timezone: 'America/Los_Angeles',
        },
      });
    });
  });

  describe('Anthropic Adapter', () => {
    const adapter = getProviderAdapter('anthropic');

    it('should create model with API key', () => {
      const result = adapter.createModel(apiKey, model);

      expect(mockAnthropicInstance).toHaveBeenCalledWith(model);
      expect(result).toEqual({ name: 'anthropic-model' });
    });

    it('should return undefined when fact-check is disabled', () => {
      const factCheckConfig: FactCheckConfig = { enabled: false };
      const tools = adapter.createTools(apiKey, factCheckConfig);

      expect(tools).toBeUndefined();
    });

    it('should create web search tools when fact-check is enabled', () => {
      const factCheckConfig: FactCheckConfig = { enabled: true };
      mockAnthropicTools.webSearch_20250305.mockReturnValue({ tool: 'web-search' });

      const tools = adapter.createTools(apiKey, factCheckConfig);

      expect(mockAnthropicTools.webSearch_20250305).toHaveBeenCalledWith({
        userLocation: undefined,
      });
      expect(tools).toEqual({ web_search: { tool: 'web-search' } });
    });

    it('should include user location when provided', () => {
      const factCheckConfig: FactCheckConfig = {
        enabled: true,
        userLocation: {
          country: 'JP',
          city: 'Tokyo',
          timezone: 'Asia/Tokyo',
        },
      };
      mockAnthropicTools.webSearch_20250305.mockReturnValue({ tool: 'web-search' });

      adapter.createTools(apiKey, factCheckConfig);

      expect(mockAnthropicTools.webSearch_20250305).toHaveBeenCalledWith({
        userLocation: {
          type: 'approximate',
          country: 'JP',
          city: 'Tokyo',
          timezone: 'Asia/Tokyo',
        },
      });
    });
  });

  describe('Google Adapter', () => {
    const adapter = getProviderAdapter('google');

    it('should create model with API key', () => {
      const result = adapter.createModel(apiKey, model);

      expect(mockGoogleInstance).toHaveBeenCalledWith(model);
      expect(result).toEqual({ name: 'google-model' });
    });

    it('should return undefined when fact-check is disabled', () => {
      const factCheckConfig: FactCheckConfig = { enabled: false };
      const tools = adapter.createTools(apiKey, factCheckConfig);

      expect(tools).toBeUndefined();
    });

    it('should create google search tools when fact-check is enabled', () => {
      const factCheckConfig: FactCheckConfig = { enabled: true };
      mockGoogleTools.googleSearch.mockReturnValue({ tool: 'google-search' });

      const tools = adapter.createTools(apiKey, factCheckConfig);

      expect(mockGoogleTools.googleSearch).toHaveBeenCalledWith({});
      expect(tools).toEqual({ google_search: { tool: 'google-search' } });
    });

    it('should ignore user location for Google adapter', () => {
      const factCheckConfig: FactCheckConfig = {
        enabled: true,
        userLocation: {
          country: 'US',
          city: 'Seattle',
        },
      };
      mockGoogleTools.googleSearch.mockReturnValue({ tool: 'google-search' });

      adapter.createTools(apiKey, factCheckConfig);

      expect(mockGoogleTools.googleSearch).toHaveBeenCalledWith({});
    });
  });
});

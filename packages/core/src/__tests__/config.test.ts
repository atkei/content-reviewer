import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createReviewConfig,
  validateConfig,
  resolveApiKey,
  DEFAULT_CONFIG,
  DEFAULT_LLM_CONFIG,
  PROVIDER_DEFAULT_MODELS,
} from '../config.js';
import type { ReviewConfig, IssueSeverity } from '../types.js';

describe('config', () => {
  describe('createReviewConfig', () => {
    it('should create config with severityLevel', () => {
      const config = createReviewConfig({
        severityLevel: 'error',
      });

      expect(config.severityLevel).toBe('error');
    });

    it('should create config with all severity levels', () => {
      const severities: IssueSeverity[] = ['error', 'warning', 'suggestion'];

      severities.forEach((severity) => {
        const config = createReviewConfig({
          severityLevel: severity,
        });
        expect(config.severityLevel).toBe(severity);
      });
    });

    it('should create config without severityLevel when undefined', () => {
      const config = createReviewConfig({});
      expect(config.severityLevel).toBeUndefined();
    });

    it('should create config with severityLevel and other options', () => {
      const config = createReviewConfig({
        language: 'ja',
        instruction: 'Custom instruction',
        severityLevel: 'warning',
        llm: {
          provider: 'anthropic',
          model: 'claude-3',
          apiKey: 'test-key',
        },
      });

      expect(config.language).toBe('ja');
      expect(config.instruction).toBe('Custom instruction');
      expect(config.severityLevel).toBe('warning');
      expect(config.llm.provider).toBe('anthropic');
      expect(config.llm.model).toBe('claude-3');
      expect(config.llm.apiKey).toBe('test-key');
    });

    it('should use defaults when input is empty', () => {
      const config = createReviewConfig({});

      expect(config.language).toBe(DEFAULT_CONFIG.language);
      expect(config.llm.provider).toBe(DEFAULT_LLM_CONFIG.provider);
      expect(config.llm.model).toBe(PROVIDER_DEFAULT_MODELS[DEFAULT_LLM_CONFIG.provider]);
      expect(config.severityLevel).toBeUndefined();
    });

    it('should preserve severityLevel through multiple config creations', () => {
      const config1 = createReviewConfig({ severityLevel: 'error' });
      const config2 = createReviewConfig({ ...config1, language: 'ja' });

      expect(config1.severityLevel).toBe('error');
      expect(config2.severityLevel).toBe('error');
      expect(config2.language).toBe('ja');
    });

    it('should handle partial llm config with severityLevel', () => {
      const config = createReviewConfig({
        severityLevel: 'warning',
        llm: {
          provider: 'google',
        },
      });

      expect(config.severityLevel).toBe('warning');
      expect(config.llm.provider).toBe('google');
      expect(config.llm.model).toBe(PROVIDER_DEFAULT_MODELS.google);
    });

    it('should not include severityLevel in config when explicitly set to undefined', () => {
      const config = createReviewConfig({
        severityLevel: undefined,
      });

      expect(config.severityLevel).toBeUndefined();
      expect('severityLevel' in config).toBe(true);
    });
  });

  describe('validateConfig with severityLevel', () => {
    it('should validate config with severityLevel', () => {
      const config: ReviewConfig = {
        language: 'en',
        llm: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'test-key',
        },
        severityLevel: 'error',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate config without severityLevel', () => {
      const config: ReviewConfig = {
        language: 'en',
        llm: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'test-key',
        },
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate config with all severity levels', () => {
      const severities: IssueSeverity[] = ['error', 'warning', 'suggestion'];

      severities.forEach((severity) => {
        const config: ReviewConfig = {
          language: 'en',
          llm: {
            provider: 'openai',
            model: 'gpt-4',
            apiKey: 'test-key',
          },
          severityLevel: severity,
        };

        expect(() => validateConfig(config)).not.toThrow();
      });
    });

    it('should still throw for missing language even with severityLevel', () => {
      const config = {
        llm: {
          provider: 'openai',
          model: 'gpt-4',
        },
        severityLevel: 'error',
      } as any;

      expect(() => validateConfig(config)).toThrow('language is required');
    });

    it('should still throw for invalid language even with severityLevel', () => {
      const config = {
        language: 'invalid',
        llm: {
          provider: 'openai',
          model: 'gpt-4',
        },
        severityLevel: 'error',
      } as any;

      expect(() => validateConfig(config)).toThrow('Invalid language');
    });

    it('should still throw for missing provider even with severityLevel', () => {
      const config = {
        language: 'en',
        llm: {
          model: 'gpt-4',
        },
        severityLevel: 'error',
      } as any;

      expect(() => validateConfig(config)).toThrow('LLM provider is required');
    });

    it('should still throw for missing model even with severityLevel', () => {
      const config = {
        language: 'en',
        llm: {
          provider: 'openai',
        },
        severityLevel: 'error',
      } as any;

      expect(() => validateConfig(config)).toThrow('LLM model is required');
    });
  });

  describe('resolveApiKey with severityLevel configs', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should resolve API key from config with severityLevel set', () => {
      const config: ReviewConfig = {
        language: 'en',
        llm: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'config-key',
        },
        severityLevel: 'error',
      };

      expect(resolveApiKey(config)).toBe('config-key');
    });

    it('should resolve API key from environment with severityLevel set', () => {
      process.env.OPENAI_API_KEY = 'env-key';

      const config: ReviewConfig = {
        language: 'en',
        llm: {
          provider: 'openai',
          model: 'gpt-4',
        },
        severityLevel: 'warning',
      };

      expect(resolveApiKey(config)).toBe('env-key');
    });

    it('should prioritize config API key over environment with severityLevel', () => {
      process.env.OPENAI_API_KEY = 'env-key';

      const config: ReviewConfig = {
        language: 'en',
        llm: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'config-key',
        },
        severityLevel: 'suggestion',
      };

      expect(resolveApiKey(config)).toBe('config-key');
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should not include severityLevel by default', () => {
      expect(DEFAULT_CONFIG.severityLevel).toBeUndefined();
    });

    it('should have expected default values', () => {
      expect(DEFAULT_CONFIG.language).toBe('en');
      expect(DEFAULT_CONFIG.llm.provider).toBe('openai');
    });
  });

  describe('PROVIDER_DEFAULT_MODELS', () => {
    it('should have models for all providers', () => {
      expect(PROVIDER_DEFAULT_MODELS.openai).toBeDefined();
      expect(PROVIDER_DEFAULT_MODELS.anthropic).toBeDefined();
      expect(PROVIDER_DEFAULT_MODELS.google).toBeDefined();
    });

    it('should have non-empty model strings', () => {
      Object.values(PROVIDER_DEFAULT_MODELS).forEach((model) => {
        expect(model).toBeTruthy();
        expect(typeof model).toBe('string');
        expect(model.length).toBeGreaterThan(0);
      });
    });
  });
});
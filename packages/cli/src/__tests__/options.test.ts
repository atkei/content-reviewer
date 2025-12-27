import { describe, it, expect } from 'vitest';
import { CLI_OPTIONS, getOptionDescription } from '../options.js';

describe('CLI_OPTIONS', () => {
  it('should have all required option definitions', () => {
    expect(CLI_OPTIONS.CONFIG).toBeDefined();
    expect(CLI_OPTIONS.INSTRUCTION).toBeDefined();
    expect(CLI_OPTIONS.OUTPUT).toBeDefined();
    expect(CLI_OPTIONS.LANGUAGE).toBeDefined();
    expect(CLI_OPTIONS.SEVERITY_LEVEL).toBeDefined();
    expect(CLI_OPTIONS.API_KEY).toBeDefined();
    expect(CLI_OPTIONS.MODEL).toBeDefined();
    expect(CLI_OPTIONS.PROVIDER).toBeDefined();
    expect(CLI_OPTIONS.JSON).toBeDefined();
    expect(CLI_OPTIONS.DRY_RUN).toBeDefined();
  });

  describe('SEVERITY_LEVEL option', () => {
    it('should have correct flag format', () => {
      expect(CLI_OPTIONS.SEVERITY_LEVEL.flag).toBe('-s, --severity-level <level>');
    });

    it('should include severity level names in description', () => {
      const description = CLI_OPTIONS.SEVERITY_LEVEL.description;
      expect(description).toContain('error');
      expect(description).toContain('warning');
      expect(description).toContain('suggestion');
    });

    it('should have default value of suggestion', () => {
      expect(CLI_OPTIONS.SEVERITY_LEVEL.defaultValue).toBe('suggestion');
    });

    it('should not have envVar defined', () => {
      expect(CLI_OPTIONS.SEVERITY_LEVEL.envVar).toBeUndefined();
    });
  });

  describe('CONFIG option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.CONFIG.flag).toBe('-c, --config <path>');
      expect(CLI_OPTIONS.CONFIG.description).toContain('configuration file');
    });
  });

  describe('INSTRUCTION option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.INSTRUCTION.flag).toBe('-i, --instruction <path>');
      expect(CLI_OPTIONS.INSTRUCTION.description).toContain('instruction file');
    });
  });

  describe('OUTPUT option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.OUTPUT.flag).toBe('-o, --output <path>');
      expect(CLI_OPTIONS.OUTPUT.description).toContain('output');
      expect(CLI_OPTIONS.OUTPUT.description).toContain('JSON');
    });
  });

  describe('LANGUAGE option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.LANGUAGE.flag).toBe('-l, --language <lang>');
      expect(CLI_OPTIONS.LANGUAGE.description).toContain('language');
      expect(CLI_OPTIONS.LANGUAGE.defaultValue).toBe('en');
    });
  });

  describe('API_KEY option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.API_KEY.flag).toBe('--api-key <key>');
      expect(CLI_OPTIONS.API_KEY.description).toContain('API key');
      expect(CLI_OPTIONS.API_KEY.envVar).toBeDefined();
    });

    it('should reference environment variables', () => {
      expect(CLI_OPTIONS.API_KEY.envVar).toContain('OPENAI_API_KEY');
      expect(CLI_OPTIONS.API_KEY.envVar).toContain('ANTHROPIC_API_KEY');
      expect(CLI_OPTIONS.API_KEY.envVar).toContain('GOOGLE_API_KEY');
    });
  });

  describe('MODEL option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.MODEL.flag).toBe('--model <model>');
      expect(CLI_OPTIONS.MODEL.description).toContain('model');
      expect(CLI_OPTIONS.MODEL.defaultValue).toBeDefined();
    });
  });

  describe('PROVIDER option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.PROVIDER.flag).toBe('--provider <provider>');
      expect(CLI_OPTIONS.PROVIDER.description).toContain('provider');
      expect(CLI_OPTIONS.PROVIDER.defaultValue).toBe('openai');
    });

    it('should mention all supported providers', () => {
      expect(CLI_OPTIONS.PROVIDER.description).toContain('openai');
      expect(CLI_OPTIONS.PROVIDER.description).toContain('anthropic');
      expect(CLI_OPTIONS.PROVIDER.description).toContain('google');
    });
  });

  describe('JSON option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.JSON.flag).toBe('--json');
      expect(CLI_OPTIONS.JSON.description).toContain('JSON');
      expect(CLI_OPTIONS.JSON.defaultValue).toBe(false);
    });
  });

  describe('DRY_RUN option', () => {
    it('should have correct structure', () => {
      expect(CLI_OPTIONS.DRY_RUN.flag).toBe('--dry-run');
      expect(CLI_OPTIONS.DRY_RUN.description).toContain('without running review');
      expect(CLI_OPTIONS.DRY_RUN.defaultValue).toBe(false);
    });
  });
});

describe('getOptionDescription', () => {
  it('should return description for option without envVar or defaultValue', () => {
    const option = {
      flag: '--test',
      description: 'Test option',
    };

    const result = getOptionDescription(option);
    expect(result).toBe('Test option');
  });

  it('should append envVar information when present', () => {
    const option = {
      flag: '--test',
      description: 'Test option',
      envVar: 'TEST_VAR',
    };

    const result = getOptionDescription(option);
    expect(result).toContain('Test option');
    expect(result).toContain('alternatively use TEST_VAR env var');
  });

  it('should append defaultValue when present', () => {
    const option = {
      flag: '--test',
      description: 'Test option',
      defaultValue: 'default-value',
    };

    const result = getOptionDescription(option);
    expect(result).toContain('Test option');
    expect(result).toContain('(default: default-value)');
  });

  it('should append both envVar and defaultValue when both present', () => {
    const option = {
      flag: '--test',
      description: 'Test option',
      envVar: 'TEST_VAR',
      defaultValue: 'default-value',
    };

    const result = getOptionDescription(option);
    expect(result).toContain('Test option');
    expect(result).toContain('alternatively use TEST_VAR env var');
    expect(result).toContain('(default: default-value)');
  });

  it('should handle boolean defaultValue', () => {
    const option = {
      flag: '--test',
      description: 'Test option',
      defaultValue: false,
    };

    const result = getOptionDescription(option);
    expect(result).toContain('(default: false)');
  });

  it('should handle number defaultValue', () => {
    const option = {
      flag: '--test',
      description: 'Test option',
      defaultValue: 42,
    };

    const result = getOptionDescription(option);
    expect(result).toContain('(default: 42)');
  });

  it('should work with actual SEVERITY_LEVEL option', () => {
    const result = getOptionDescription(CLI_OPTIONS.SEVERITY_LEVEL);
    expect(result).toContain('minimum severity level to display');
    expect(result).toContain('error');
    expect(result).toContain('warning');
    expect(result).toContain('suggestion');
    expect(result).toContain('(default: suggestion)');
  });

  it('should work with actual API_KEY option', () => {
    const result = getOptionDescription(CLI_OPTIONS.API_KEY);
    expect(result).toContain('LLM provider API key');
    expect(result).toContain('alternatively use');
    expect(result).toContain('OPENAI_API_KEY');
  });
});
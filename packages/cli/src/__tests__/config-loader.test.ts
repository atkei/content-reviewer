import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfiguration } from '../config-loader.js';
import { readFile } from 'fs/promises';

// Mock cosmiconfig
const mockSearch = vi.fn();
const mockLoad = vi.fn();

vi.mock('cosmiconfig', () => ({
  cosmiconfig: vi.fn(() => ({
    search: mockSearch,
    load: mockLoad,
  })),
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('loadConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default configuration when no config file is found', async () => {
    mockSearch.mockResolvedValue(null);

    // We need to set an API key in env or it will throw during validation
    process.env.OPENAI_API_KEY = 'test-key';

    const config = await loadConfiguration({});
    expect(config.language).toBe('en');
    expect(config.llm.provider).toBe('openai');

    delete process.env.OPENAI_API_KEY;
  });

  it('should override defaults with CLI options', async () => {
    mockSearch.mockResolvedValue(null);
    process.env.ANTHROPIC_API_KEY = 'test-key';

    const config = await loadConfiguration({
      language: 'ja',
      provider: 'anthropic',
    });
    expect(config.language).toBe('ja');
    expect(config.llm.provider).toBe('anthropic');

    delete process.env.ANTHROPIC_API_KEY;
  });

  it('should load instruction from file', async () => {
    mockSearch.mockResolvedValue(null);
    process.env.OPENAI_API_KEY = 'test-key';

    // Mock readFile for instruction
    const mockReadFile = readFile as any;
    mockReadFile.mockResolvedValue('My custom instruction');

    const config = await loadConfiguration({
      instruction: 'instructions.md',
    });

    expect(mockReadFile).toHaveBeenCalledWith(expect.stringContaining('instructions.md'), 'utf-8');
    expect(config.instruction).toBe('My custom instruction');

    delete process.env.OPENAI_API_KEY;
  });

  it('should handle severityLevel from CLI options', async () => {
    mockSearch.mockResolvedValue(null);
    process.env.OPENAI_API_KEY = 'test-key';

    const config = await loadConfiguration({
      severityLevel: 'error',
    });

    expect(config.severityLevel).toBe('error');

    delete process.env.OPENAI_API_KEY;
  });

  it('should handle severityLevel from config file', async () => {
    mockSearch.mockResolvedValue({
      config: {
        severityLevel: 'warning',
      },
      filepath: '/path/to/config',
    });
    process.env.OPENAI_API_KEY = 'test-key';

    const config = await loadConfiguration({});

    expect(config.severityLevel).toBe('warning');

    delete process.env.OPENAI_API_KEY;
  });

  it('should prioritize CLI severityLevel over file config', async () => {
    mockSearch.mockResolvedValue({
      config: {
        severityLevel: 'suggestion',
      },
      filepath: '/path/to/config',
    });
    process.env.OPENAI_API_KEY = 'test-key';

    const config = await loadConfiguration({
      severityLevel: 'error',
    });

    expect(config.severityLevel).toBe('error');

    delete process.env.OPENAI_API_KEY;
  });

  it('should set severityLevel to undefined when default value is passed', async () => {
    mockSearch.mockResolvedValue(null);
    process.env.OPENAI_API_KEY = 'test-key';

    const config = await loadConfiguration({
      severityLevel: 'suggestion', // default value
    });

    expect(config.severityLevel).toBeUndefined();

    delete process.env.OPENAI_API_KEY;
  });

  it('should handle all severityLevel values', async () => {
    mockSearch.mockResolvedValue(null);
    process.env.OPENAI_API_KEY = 'test-key';

    const severities: Array<'error' | 'warning' | 'suggestion'> = ['error', 'warning', 'suggestion'];

    for (const severity of severities) {
      const config = await loadConfiguration({
        severityLevel: severity,
      });

      if (severity === 'suggestion') {
        expect(config.severityLevel).toBeUndefined();
      } else {
        expect(config.severityLevel).toBe(severity);
      }
    }

    delete process.env.OPENAI_API_KEY;
  });

  it('should merge severityLevel with other config options', async () => {
    mockSearch.mockResolvedValue({
      config: {
        language: 'ja',
        severityLevel: 'warning',
      },
      filepath: '/path/to/config',
    });
    process.env.ANTHROPIC_API_KEY = 'test-key';

    const config = await loadConfiguration({
      provider: 'anthropic',
      severityLevel: 'error',
    });

    expect(config.language).toBe('ja');
    expect(config.llm.provider).toBe('anthropic');
    expect(config.severityLevel).toBe('error');

    delete process.env.ANTHROPIC_API_KEY;
  });

  it('should load config file from explicit path with severityLevel', async () => {
    mockLoad.mockResolvedValue({
      config: {
        language: 'en',
        severityLevel: 'error',
      },
      filepath: '/explicit/path/config.js',
    });
    process.env.OPENAI_API_KEY = 'test-key';

    const config = await loadConfiguration({
      config: '/explicit/path/config.js',
    });

    expect(config.severityLevel).toBe('error');
    expect(mockLoad).toHaveBeenCalled();

    delete process.env.OPENAI_API_KEY;
  });
});

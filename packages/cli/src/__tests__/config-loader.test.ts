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
});

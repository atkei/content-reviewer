import { describe, it, expect } from 'vitest';
import { getLanguagePrompts } from '../prompts.js';
import { DEFAULT_INSTRUCTION_EN, DEFAULT_INSTRUCTION_JA } from '../default-instructions.js';

describe('prompts', () => {
  describe('ja', () => {
    const prompts = getLanguagePrompts('ja');

    it('should use default instruction when not provided', () => {
      const systemPrompt = prompts.buildSystemPrompt({});
      expect(systemPrompt).toContain(DEFAULT_INSTRUCTION_JA);
    });

    it('should use custom instruction when provided', () => {
      const customInstruction = '# Custom Instruction\n- Check for typos.';
      const systemPrompt = prompts.buildSystemPrompt({
        instruction: customInstruction,
      });

      expect(systemPrompt).toContain(customInstruction);
      expect(systemPrompt).not.toContain(DEFAULT_INSTRUCTION_JA);
    });
  });

  describe('en', () => {
    const prompts = getLanguagePrompts('en');

    it('should use default instruction when not provided', () => {
      const systemPrompt = prompts.buildSystemPrompt({});
      expect(systemPrompt).toContain(DEFAULT_INSTRUCTION_EN);
    });

    it('should use custom instruction when provided', () => {
      const customInstruction = '# Custom Instruction\n- Check for typos.';
      const systemPrompt = prompts.buildSystemPrompt({
        instruction: customInstruction,
      });

      expect(systemPrompt).toContain(customInstruction);
      expect(systemPrompt).not.toContain(DEFAULT_INSTRUCTION_EN);
    });
  });
});

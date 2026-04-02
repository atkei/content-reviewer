import { describe, it, expect } from 'vitest';
import {
  buildFactCheckPlanPrompt,
  buildFactCheckPrompt,
  buildReviewPromptWithFactCheck,
} from '../../fact-check/prompts.js';

describe('fact-check-prompts', () => {
  it('buildFactCheckPlanPrompt should include JSON output guidance', () => {
    const prompt = buildFactCheckPlanPrompt('Instruction');
    expect(prompt).toContain('Return JSON only');
    expect(prompt).toContain('"claims"');
  });

  it('buildFactCheckPrompt should enforce strict Markdown format', () => {
    const { system, prompt } = buildFactCheckPrompt(
      'Instruction',
      [{ id: 'C1', text: 'Node.js 20 is supported.' }],
      'Content',
      '2024-01-01'
    );

    expect(system).toContain('Do not use bold, italics, inline code, or code fences.');
    expect(system).toContain('### Claim <ID>');
    expect(system).toContain('Reference date: 2024-01-01');
    expect(prompt).toContain('- C1: Node.js 20 is supported.');
  });

  it('buildReviewPromptWithFactCheck should embed reference date and results', () => {
    const prompt = buildReviewPromptWithFactCheck('Content', 'Result', '2024-01-01');
    expect(prompt).toContain('Fact-Check Results');
    expect(prompt).toContain('Reference date: 2024-01-01');
  });
});

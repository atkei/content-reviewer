import { describe, it, expect } from 'vitest';
import { formatReviewResult, formatReviewResultJSON } from '../utils.js';
import type { ReviewResult } from '@content-reviewer/core';

describe('formatReviewResultJSON', () => {
  it('should format review result as JSON', () => {
    const result: ReviewResult = {
      source: 'test.md',
      summary: 'Test summary',
      issues: [],
      reviewedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const json = formatReviewResultJSON(result);
    const parsed = JSON.parse(json);

    expect(parsed.source).toBe('test.md');
    expect(parsed.summary).toBe('Test summary');
    expect(json).toContain('"source": "test.md"');
  });

  it('should handle result with issues', () => {
    const result: ReviewResult = {
      source: 'test.md',
      summary: 'Test summary',
      issues: [
        {
          severity: 'warning',
          message: 'Test issue',
          lineNumber: 10,
          suggestion: 'Fix this',
        },
      ],
      reviewedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const json = formatReviewResultJSON(result);
    const parsed = JSON.parse(json);

    expect(parsed.issues).toHaveLength(1);
    expect(parsed.issues[0].message).toBe('Test issue');
  });
});

describe('formatReviewResult', () => {
  it('should format review result with no issues', () => {
    const result: ReviewResult = {
      source: 'test.md',
      summary: 'Great content!',
      issues: [],
      reviewedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const formatted = formatReviewResult(result);

    expect(formatted).toContain('test.md');
    expect(formatted).toContain('Great content!');
    expect(formatted).toContain('No issues found!');
  });

  it('should format review result with issues', () => {
    const result: ReviewResult = {
      source: 'test.md',
      summary: 'Some issues found',
      issues: [
        {
          severity: 'warning',
          message: 'Consider improving this',
          lineNumber: 10,
          suggestion: 'Use better wording',
        },
        {
          severity: 'error',
          message: 'Accuracy issue',
          lineNumber: 15,
        },
      ],
      reviewedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const formatted = formatReviewResult(result);

    expect(formatted).toContain('test.md');
    expect(formatted).toContain('Some issues found');
    expect(formatted).toContain('Issues (2)');
    expect(formatted).toContain('Consider improving this');
    expect(formatted).toContain('Accuracy issue');
    expect(formatted).toContain('Line 10');
    expect(formatted).toContain('Line 15');
    expect(formatted).toContain('Use better wording');
  });

  it('should handle different severity levels', () => {
    const result: ReviewResult = {
      source: 'test.md',
      summary: 'Multiple severity levels',
      issues: [
        {
          severity: 'error',
          message: 'Error issue',
        },
        {
          severity: 'warning',
          message: 'Warning issue',
        },
        {
          severity: 'suggestion',
          message: 'Suggestion issue',
        },
      ],
      reviewedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const formatted = formatReviewResult(result);

    expect(formatted).toContain('ERROR');
    expect(formatted).toContain('WARNING');
    expect(formatted).toContain('SUGGESTION');
  });

  it('should format issue without line number', () => {
    const result: ReviewResult = {
      source: 'test.md',
      summary: 'Issue without line',
      issues: [
        {
          severity: 'suggestion',
          message: 'General issue',
        },
      ],
      reviewedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const formatted = formatReviewResult(result);

    expect(formatted).toContain('General issue');
    expect(formatted).not.toContain('Line');
  });
});

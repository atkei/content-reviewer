import { describe, it, expect } from 'vitest';
import { filterIssuesBySeverity, SEVERITY_LEVELS } from '../filter.js';
import type { ReviewIssue } from '../types.js';

describe('filter', () => {
  describe('SEVERITY_LEVELS', () => {
    it('should have correct priority order', () => {
      expect(SEVERITY_LEVELS.error).toBeGreaterThan(SEVERITY_LEVELS.warning);
      expect(SEVERITY_LEVELS.warning).toBeGreaterThan(SEVERITY_LEVELS.suggestion);
    });
  });

  describe('filterIssuesBySeverity', () => {
    const mockIssues: ReviewIssue[] = [
      { severity: 'error', message: 'Error issue' },
      { severity: 'warning', message: 'Warning issue' },
      { severity: 'suggestion', message: 'Suggestion issue' },
    ];

    it('should return all issues when minLevel is suggestion', () => {
      const result = filterIssuesBySeverity(mockIssues, 'suggestion');
      expect(result).toHaveLength(3);
    });

    it('should return only warning and error when minLevel is warning', () => {
      const result = filterIssuesBySeverity(mockIssues, 'warning');
      expect(result).toHaveLength(2);
      expect(result.map((i) => i.severity)).toEqual(['error', 'warning']);
    });

    it('should return only error when minLevel is error', () => {
      const result = filterIssuesBySeverity(mockIssues, 'error');
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });

    it('should return empty array when no issues match', () => {
      const onlySuggestions: ReviewIssue[] = [
        { severity: 'suggestion', message: 'Suggestion 1' },
        { severity: 'suggestion', message: 'Suggestion 2' },
      ];
      const result = filterIssuesBySeverity(onlySuggestions, 'error');
      expect(result).toHaveLength(0);
    });

    it('should handle empty issues array', () => {
      const result = filterIssuesBySeverity([], 'error');
      expect(result).toHaveLength(0);
    });

    it('should preserve issue properties', () => {
      const issueWithDetails: ReviewIssue[] = [
        {
          severity: 'error',
          message: 'Error message',
          matchText: 'some text',
          lineNumber: 10,
          suggestion: 'Fix suggestion',
        },
      ];
      const result = filterIssuesBySeverity(issueWithDetails, 'error');
      expect(result[0]).toEqual(issueWithDetails[0]);
    });

    it('should maintain original issue order', () => {
      const issues: ReviewIssue[] = [
        { severity: 'error', message: 'Error 1' },
        { severity: 'warning', message: 'Warning 1' },
        { severity: 'error', message: 'Error 2' },
        { severity: 'warning', message: 'Warning 2' },
      ];
      const result = filterIssuesBySeverity(issues, 'warning');
      expect(result).toHaveLength(4);
      expect(result[0].message).toBe('Error 1');
      expect(result[1].message).toBe('Warning 1');
      expect(result[2].message).toBe('Error 2');
      expect(result[3].message).toBe('Warning 2');
    });

    it('should handle mixed severity levels correctly', () => {
      const issues: ReviewIssue[] = [
        { severity: 'suggestion', message: 'Suggestion' },
        { severity: 'error', message: 'Error' },
        { severity: 'warning', message: 'Warning' },
        { severity: 'suggestion', message: 'Another suggestion' },
        { severity: 'error', message: 'Another error' },
      ];

      const errorOnly = filterIssuesBySeverity(issues, 'error');
      expect(errorOnly).toHaveLength(2);
      expect(errorOnly.every((i) => i.severity === 'error')).toBe(true);

      const warningAndAbove = filterIssuesBySeverity(issues, 'warning');
      expect(warningAndAbove).toHaveLength(3);

      const all = filterIssuesBySeverity(issues, 'suggestion');
      expect(all).toHaveLength(5);
    });

    it('should not mutate original issues array', () => {
      const issues: ReviewIssue[] = [
        { severity: 'error', message: 'Error' },
        { severity: 'suggestion', message: 'Suggestion' },
      ];
      const originalLength = issues.length;
      const originalFirstMessage = issues[0].message;

      filterIssuesBySeverity(issues, 'error');

      expect(issues).toHaveLength(originalLength);
      expect(issues[0].message).toBe(originalFirstMessage);
    });

    it('should preserve all optional properties', () => {
      const issues: ReviewIssue[] = [
        {
          severity: 'warning',
          message: 'Warning with all props',
          matchText: 'matched text',
          lineNumber: 42,
          suggestion: 'Fix it this way',
        },
      ];
      const result = filterIssuesBySeverity(issues, 'suggestion');
      expect(result[0]).toEqual(issues[0]);
      expect(result[0].matchText).toBe('matched text');
      expect(result[0].lineNumber).toBe(42);
      expect(result[0].suggestion).toBe('Fix it this way');
    });

    it('should handle issues without optional properties', () => {
      const minimalIssues: ReviewIssue[] = [
        { severity: 'error', message: 'Minimal error' },
        { severity: 'warning', message: 'Minimal warning' },
      ];
      const result = filterIssuesBySeverity(minimalIssues, 'warning');
      expect(result).toHaveLength(2);
      expect(result[0].matchText).toBeUndefined();
      expect(result[0].lineNumber).toBeUndefined();
      expect(result[0].suggestion).toBeUndefined();
    });

    it('should work with readonly issues array', () => {
      const readonlyIssues: readonly ReviewIssue[] = [
        { severity: 'error', message: 'Error' },
        { severity: 'warning', message: 'Warning' },
      ];
      const result = filterIssuesBySeverity(readonlyIssues, 'error');
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('error');
    });
  });

  describe('DEFAULT_SEVERITY_LEVEL', () => {
    it('should be the lowest priority level', () => {
      const { DEFAULT_SEVERITY_LEVEL } = await import('../filter.js');
      expect(DEFAULT_SEVERITY_LEVEL).toBe('suggestion');
    });

    it('should match the minimum value in SEVERITY_LEVELS', () => {
      const { DEFAULT_SEVERITY_LEVEL } = await import('../filter.js');
      const minValue = Math.min(...Object.values(SEVERITY_LEVELS));
      expect(SEVERITY_LEVELS[DEFAULT_SEVERITY_LEVEL]).toBe(minValue);
    });
  });

  describe('SEVERITY_LEVELS constants', () => {
    it('should be readonly', () => {
      expect(() => {
        (SEVERITY_LEVELS as any).error = 10;
      }).toThrow();
    });

    it('should have distinct values for each level', () => {
      const values = Object.values(SEVERITY_LEVELS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should use positive integers', () => {
      Object.values(SEVERITY_LEVELS).forEach((value) => {
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
      });
    });
  });
});

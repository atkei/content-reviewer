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
  });
});

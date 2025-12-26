import type { IssueSeverity, ReviewIssue } from './types.js';

/**
 * Severity level priority mapping.
 * Higher values = more severe.
 */
export const SEVERITY_LEVELS: Readonly<Record<IssueSeverity, number>> = {
  error: 3,
  warning: 2,
  suggestion: 1,
} as const;

/**
 * Default minimum severity level (includes all issues).
 * Derived from SEVERITY_LEVELS as the lowest priority level.
 */
export const DEFAULT_SEVERITY_LEVEL = (Object.keys(SEVERITY_LEVELS) as IssueSeverity[]).reduce(
  (min, key) => (SEVERITY_LEVELS[key] < SEVERITY_LEVELS[min] ? key : min)
);

/**
 * Filters issues by minimum severity level.
 * Returns issues with severity >= minLevel.
 */
export function filterIssuesBySeverity(
  issues: readonly ReviewIssue[],
  minLevel: IssueSeverity
): ReviewIssue[] {
  const minLevelValue = SEVERITY_LEVELS[minLevel];
  return issues.filter((issue) => SEVERITY_LEVELS[issue.severity] >= minLevelValue);
}

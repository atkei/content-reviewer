import type { ReviewIssue } from './types.js';
import { SEVERITY_LEVELS, type IssueSeverity } from './severity.js';

export function filterIssuesBySeverity(
  issues: readonly ReviewIssue[],
  minLevel: IssueSeverity
): ReviewIssue[] {
  const minLevelValue = SEVERITY_LEVELS[minLevel];
  return issues.filter((issue) => SEVERITY_LEVELS[issue.severity] >= minLevelValue);
}

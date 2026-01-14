import type { ReviewResult, ReviewIssue } from '@content-reviewer/core';
import pc from 'picocolors';

export function formatReviewResult(result: ReviewResult): string {
  let output = '';

  output += `${pc.bold(`Review Result: ${result.source}`)}

`;

  if (result.issues.length === 0) {
    output += `${pc.green('✓ No issues found!')}
`;
  } else {
    output += `${pc.bold(`Issues (${result.issues.length}):`)}

`;
    result.issues.forEach((issue, index) => {
      output += formatIssue(issue, index + 1);
    });
  }

  return output;
}

function formatIssue(issue: ReviewIssue, index: number): string {
  const severityIcon = getSeverityIcon(issue.severity);
  const severityColorFn = getSeverityColorFn(issue.severity);

  let output = `${pc.bold(`${index}.`)} `;
  output += `${severityColorFn(`${severityIcon} ${issue.severity.toUpperCase()}`)}
`;

  if (issue.lineNumber) {
    output += `   ${pc.gray(`Line ${issue.lineNumber}:`)} `;
  } else {
    output += `   `;
  }

  output += `${issue.message}
`;

  if (issue.matchText) {
    output += `   ${pc.gray(`Snippet: "${issue.matchText}"`)}
`;
  }

  if (issue.suggestion) {
    output += `   ${pc.cyan('💡 Suggestion:')} ${issue.suggestion}
`;
  }

  if (issue.source) {
    const sourceText = issue.source.title
      ? `${issue.source.title} (${issue.source.url})`
      : issue.source.url;
    output += `   ${pc.blue('🔗 Source:')} ${sourceText}
`;
  }

  output += '\n';

  return output;
}

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'error':
      return '✗';
    case 'warning':
      return '⚠';
    case 'suggestion':
      return '💡';
    default:
      return '•';
  }
}

function getSeverityColorFn(severity: string): (text: string) => string {
  switch (severity) {
    case 'error':
      return pc.red;
    case 'warning':
      return pc.yellow;
    case 'suggestion':
      return pc.cyan;
    default:
      return (text: string) => text;
  }
}

export function formatReviewResultJSON(result: ReviewResult): string {
  return JSON.stringify(result, null, 2);
}

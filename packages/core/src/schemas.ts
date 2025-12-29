import { z } from 'zod';
import { SEVERITY_LEVELS, type IssueSeverity } from './severity.js';

const severityKeys = Object.keys(SEVERITY_LEVELS) as [IssueSeverity, ...IssueSeverity[]];

export const reviewIssueSchema = z.object({
  severity: z.enum(severityKeys),
  message: z.string(),
  matchText: z.string().optional(),
  lineNumber: z.number().optional(),
  suggestion: z.string().optional(),
});

export const reviewResponseSchema = z.object({
  issues: z.array(reviewIssueSchema),
  summary: z.string(),
});

export type ReviewIssueSchema = z.infer<typeof reviewIssueSchema>;
export type ReviewResponseSchema = z.infer<typeof reviewResponseSchema>;

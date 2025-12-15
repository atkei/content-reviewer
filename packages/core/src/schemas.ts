import { z } from 'zod';

export const reviewIssueSchema = z.object({
  severity: z.enum(['error', 'warning', 'suggestion']),
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

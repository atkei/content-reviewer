import { z } from 'zod';

export const factCheckClaimSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const factCheckPlanSchema = z.object({
  claims: z.array(factCheckClaimSchema).max(20),
});

export type FactCheckClaim = z.infer<typeof factCheckClaimSchema>;

export function formatClaimsForPrompt(claims: FactCheckClaim[]): string {
  return claims.map((c) => `- ${c.id}: ${c.text}`).join('\n');
}

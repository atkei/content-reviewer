import { formatClaimsForPrompt, type FactCheckClaim } from './schema.js';

export function buildFactCheckPlanPrompt(factCheckInstruction: string): string {
  return `${factCheckInstruction.trim()}

## Task
Based on the verification criteria above, extract claims from the content that need to be verified.

## Output Format
Return JSON only:
{
  "claims": [
    { "id": "C1", "text": "claim text" },
    { "id": "C2", "text": "claim text" }
  ]
}

Rules:
- Include only claims that can be verified via web sources.
- Use the original language of the content.
- Keep claim text concise and specific.
- If there are no verifiable claims, return { "claims": [] }.
`;
}

export function buildFactCheckPrompt(
  factCheckInstruction: string,
  claims: FactCheckClaim[],
  userPrompt: string,
  asOf: string
): { system: string; prompt: string } {
  const system = `${factCheckInstruction.trim()}

Reference date: ${asOf}

## Task
Verify each claim using web search and report your findings.

## Output (strict Markdown format)
Use the exact format below for each claim. Do not add extra sections or text.
Do not use bold, italics, inline code, or code fences. Use plain text only.

Format:
### Claim <ID>
Claim: <claim text>
Status: verified | contradicted | uncertain
Rationale: <1-3 short sentences, cite evidence from web search>
Sources:
- <url>
- <url>

Rules:
- Keep one blank line between claims.
- If no sources, write "Sources:" followed by "- none".
- Do not invent URLs. Base verification on web search evidence, not prior knowledge.`;

  const prompt = `Claims to verify:
${formatClaimsForPrompt(claims)}

Content:
${userPrompt}`;

  return { system, prompt };
}

export function buildReviewPromptWithFactCheck(
  originalPrompt: string,
  factCheckResult: string,
  asOf: string
): string {
  return `## Fact-Check Results (for reference)
${factCheckResult}

## Content to Review
${originalPrompt}

Reference date: ${asOf}

Consider the fact-check results above when generating your review.`;
}

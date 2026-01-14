import { generateObject } from 'ai';
import { factCheckPlanSchema, type FactCheckClaim } from '../fact-check.js';
import { buildFactCheckPlanPrompt } from './prompts/fact-check-prompts.js';
import type { AISdkModel } from './providers/types.js';

export async function generateFactCheckPlan(
  model: AISdkModel,
  userPrompt: string,
  factCheckInstruction: string
): Promise<FactCheckClaim[]> {
  const systemPrompt = buildFactCheckPlanPrompt(factCheckInstruction);
  try {
    const { object } = await generateObject({
      model,
      schema: factCheckPlanSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    return object.claims ?? [];
  } catch {
    return [];
  }
}

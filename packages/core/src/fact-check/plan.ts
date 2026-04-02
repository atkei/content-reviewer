import { generateObject } from 'ai';
import { factCheckPlanSchema, type FactCheckClaim } from './schema.js';
import { buildFactCheckPlanPrompt } from './prompts.js';
import type { AISdkModel } from '../llm/providers/types.js';

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

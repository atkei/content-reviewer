import { generateText, type ToolSet } from 'ai';
import type { AISdkModel } from './providers/types.js';

export async function runFactCheck(
  model: AISdkModel,
  tools: ToolSet,
  system: string,
  prompt: string
): Promise<string> {
  const { text } = await generateText({
    model,
    system,
    prompt,
    tools,
    toolChoice: 'required',
  });

  return text;
}

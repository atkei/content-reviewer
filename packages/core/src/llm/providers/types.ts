import type { ToolSet, generateObject } from 'ai';
import type { FactCheckConfig } from '../../types.js';

export type AISdkModel = Parameters<typeof generateObject>[0]['model'];

export type ProviderAdapter = Readonly<{
  createModel: (apiKey: string, model: string) => AISdkModel;
  createTools: (apiKey: string, factCheckConfig: FactCheckConfig) => ToolSet | undefined;
}>;

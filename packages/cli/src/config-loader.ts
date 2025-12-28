import { resolve, dirname } from 'path';
import { readFile } from 'fs/promises';
import { cosmiconfig } from 'cosmiconfig';
import {
  createReviewConfig,
  validateConfig,
  type Language,
  type LLMProvider,
  type IssueSeverity,
} from '@content-reviewer/core';
import { consola } from 'consola';
import type { UserConfigFile } from './types.js';
import { CONFIG_MODULE_NAME } from './constants.js';
import { CLI_OPTIONS } from './options.js';

export async function loadConfiguration(
  options: Record<string, unknown>
): Promise<ReturnType<typeof createReviewConfig>> {
  let fileConfig: UserConfigFile = {};
  let configDir = process.cwd();

  if (options.config && typeof options.config === 'string') {
    const configPath = resolve(process.cwd(), options.config);
    try {
      const explorer = cosmiconfig(CONFIG_MODULE_NAME);
      const result = await explorer.load(configPath);
      if (result) {
        fileConfig = result.config as UserConfigFile;
        configDir = dirname(result.filepath);
      }
    } catch (error) {
      consola.warn(
        `Failed to load config file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } else {
    try {
      const explorer = cosmiconfig(CONFIG_MODULE_NAME);
      const result = await explorer.search();
      if (result) {
        fileConfig = result.config as UserConfigFile;
        configDir = dirname(result.filepath);
        consola.success(`Loaded config from: ${result.filepath}`);
      }
    } catch {
      // No config file found, use defaults
    }
  }

  let instructionContent: string | undefined;

  if (options.instruction && typeof options.instruction === 'string') {
    try {
      const instructionPath = resolve(process.cwd(), options.instruction);
      instructionContent = await readFile(instructionPath, 'utf-8');
      consola.success(`Loaded instruction from: ${instructionPath}`);
    } catch (error) {
      consola.warn(
        `Failed to load instruction file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } else if (fileConfig.instructionFile) {
    try {
      const instructionPath = resolve(configDir, fileConfig.instructionFile);
      instructionContent = await readFile(instructionPath, 'utf-8');
      consola.success(`Loaded instruction from: ${instructionPath}`);
    } catch (error) {
      consola.warn(
        `Failed to load instruction file from config: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  const severityLevel =
    (options.severityLevel as IssueSeverity | undefined) ?? fileConfig.severityLevel;

  const config = createReviewConfig({
    ...fileConfig,
    instruction: instructionContent,
    language: (options.language as Language | undefined) ?? fileConfig.language,
    llm: {
      ...fileConfig.llm,
      provider: (options.provider as LLMProvider | undefined) ?? fileConfig.llm?.provider,
      apiKey: (options.apiKey as string | undefined) ?? fileConfig.llm?.apiKey,
      model: (options.model as string | undefined) ?? fileConfig.llm?.model,
    },
    severityLevel:
      severityLevel === CLI_OPTIONS.SEVERITY_LEVEL.defaultValue ? undefined : severityLevel,
  });

  validateConfig(config);

  return config;
}

import {
  DEFAULT_CONFIG,
  DEFAULT_LLM_CONFIG,
  PROVIDER_DEFAULT_MODELS,
  ENV_VARS,
} from '@content-reviewer/core';

export interface CliOptionDefinition {
  flag: string;
  description: string;
  defaultValue?: string | number | boolean;
  envVar?: string;
}

export const CLI_OPTIONS = {
  CONFIG: {
    flag: '-c, --config <path>',
    description: 'path to review configuration file',
  },
  INSTRUCTION: {
    flag: '-i, --instruction <path>',
    description: 'path to review instruction file',
  },
  OUTPUT: {
    flag: '-o, --output <path>',
    description: 'output review result file path (JSON format)',
  },
  LANGUAGE: {
    flag: '-l, --language <lang>',
    description: 'review language (ja, en)',
    defaultValue: DEFAULT_CONFIG.language,
  },
  API_KEY: {
    flag: '--api-key <key>',
    description: 'LLM provider API key',
    envVar: `${ENV_VARS.OPENAI_API_KEY}, ${ENV_VARS.ANTHROPIC_API_KEY}, or ${ENV_VARS.GOOGLE_API_KEY}`,
  },
  MODEL: {
    flag: '--model <model>',
    description: 'LLM model to use',
    defaultValue: Object.entries(PROVIDER_DEFAULT_MODELS)
      .map(([p, m]) => `${m} (${p})`)
      .join(', '),
  },
  PROVIDER: {
    flag: '--provider <provider>',
    description: 'LLM provider (openai, anthropic, google)',
    defaultValue: DEFAULT_LLM_CONFIG.provider,
  },
  JSON: {
    flag: '--json',
    description: 'output review result in JSON format (to stdout)',
    defaultValue: false,
  },
  DRY_RUN: {
    flag: '--dry-run',
    description: 'display configuration and instructions without running review',
    defaultValue: false,
  },
} as const;

export function getOptionDescription(option: CliOptionDefinition): string {
  let desc = option.description;

  if (option.envVar) {
    desc += ` (alternatively use ${option.envVar} env var)`;
  }

  if (option.defaultValue !== undefined) {
    desc += ` (default: ${option.defaultValue})`;
  }

  return desc;
}

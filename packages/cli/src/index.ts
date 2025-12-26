#!/usr/bin/env node

import { Command } from 'commander';
import { handleReviewAction } from './commands/review.js';
import { PROGRAM_NAME, PROGRAM_DESCRIPTION, PROGRAM_VERSION } from './constants.js';

import { CLI_OPTIONS, getOptionDescription } from './options.js';

const program = new Command();

program.name(PROGRAM_NAME).description(PROGRAM_DESCRIPTION).version(PROGRAM_VERSION);

program
  .argument('<file>', 'File to review')
  .option(CLI_OPTIONS.CONFIG.flag, getOptionDescription(CLI_OPTIONS.CONFIG))
  .option(CLI_OPTIONS.INSTRUCTION.flag, getOptionDescription(CLI_OPTIONS.INSTRUCTION))
  .option(CLI_OPTIONS.OUTPUT.flag, getOptionDescription(CLI_OPTIONS.OUTPUT))
  .option(CLI_OPTIONS.LANGUAGE.flag, getOptionDescription(CLI_OPTIONS.LANGUAGE))
  .option(CLI_OPTIONS.SEVERITY_LEVEL.flag, getOptionDescription(CLI_OPTIONS.SEVERITY_LEVEL))
  .option(CLI_OPTIONS.PROVIDER.flag, getOptionDescription(CLI_OPTIONS.PROVIDER))
  .option(CLI_OPTIONS.MODEL.flag, getOptionDescription(CLI_OPTIONS.MODEL))
  .option(CLI_OPTIONS.API_KEY.flag, getOptionDescription(CLI_OPTIONS.API_KEY))
  .option(CLI_OPTIONS.JSON.flag, getOptionDescription(CLI_OPTIONS.JSON))
  .option(CLI_OPTIONS.DRY_RUN.flag, getOptionDescription(CLI_OPTIONS.DRY_RUN))
  .action(handleReviewAction);

program.parse();

import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import {
  ContentReviewer,
  resolveApiKey,
  DEFAULT_INSTRUCTION_EN,
  DEFAULT_INSTRUCTION_JA,
} from '@content-reviewer/core';
import { consola } from 'consola';
import { loadConfiguration } from '../config-loader.js';
import { readDocument } from '../document.js';
import { formatReviewResult, formatReviewResultJSON } from '../utils.js';
import { EXIT_CODES } from '../constants.js';

export async function handleReviewAction(
  file: string,
  options: Record<string, unknown>
): Promise<void> {
  try {
    const filePath = resolve(process.cwd(), file);
    const config = await loadConfiguration(options);

    if (options.dryRun) {
      consola.info('Dry Run: Configuration Preview');
      consola.log(`Target File: ${filePath}`);
      consola.log(`Model: ${config.llm.model} (${config.llm.provider})`);
      consola.log(`Language: ${config.language}`);
      consola.log('\n[Applied Instructions]');

      if (config.instruction) {
        consola.log(config.instruction);
      } else {
        const defaultInstruction =
          config.language === 'ja' ? DEFAULT_INSTRUCTION_JA : DEFAULT_INSTRUCTION_EN;
        consola.log(defaultInstruction);
        consola.log('\n(Note: These are the default instructions for the selected language)');
      }

      consola.info('End of Preview');
      process.exit(EXIT_CODES.SUCCESS);
    }

    resolveApiKey(config);

    consola.start(`Reading document: ${filePath}`);
    const document = await readDocument(filePath);
    consola.success(`Document read successfully`);

    consola.start('Initializing AI reviewer...');
    const reviewer = new ContentReviewer(config);

    consola.start('Reviewing content (this may take a moment)...');
    const result = await reviewer.review(document);

    if (options.json) {
      consola.log(formatReviewResultJSON(result));
    } else {
      consola.log(formatReviewResult(result));
    }

    if (options.output && typeof options.output === 'string') {
      const outputPath = resolve(process.cwd(), options.output);
      await writeFile(outputPath, formatReviewResultJSON(result), 'utf-8');
      consola.success(`Results saved to: ${outputPath}`);
    }

    const hasErrors = result.issues.some((issue) => issue.severity === 'error');
    process.exit(hasErrors ? EXIT_CODES.ERROR : EXIT_CODES.SUCCESS);
  } catch (error) {
    consola.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(EXIT_CODES.ERROR);
  }
}

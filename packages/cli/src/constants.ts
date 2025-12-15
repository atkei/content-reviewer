import pkg from '../package.json';

export const PROGRAM_NAME = 'content-review';
export const PROGRAM_DESCRIPTION = pkg.description;
export const PROGRAM_VERSION = pkg.version;

export const CONFIG_MODULE_NAME = 'reviewrc';

export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
} as const;

import type { ReviewConfigInput } from '@content-reviewer/core';

export type UserConfigFile = ReviewConfigInput &
  Readonly<{
    instructionFile?: string;
  }>;

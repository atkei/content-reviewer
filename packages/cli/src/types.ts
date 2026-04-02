import type { ReviewConfigInput, FactCheckConfig } from '@content-reviewer/core';

export type UserConfigFile = Omit<ReviewConfigInput, 'factCheck'> &
  Readonly<{
    instructionFile?: string;
    factCheck?: Partial<FactCheckConfig> & {
      instructionFile?: string;
    };
  }>;

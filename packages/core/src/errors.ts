export class ContentReviewerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentReviewerError';
  }
}

export class LLMError extends ContentReviewerError {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export class UnsupportedProviderError extends ContentReviewerError {
  constructor(provider: string) {
    super(`Unsupported provider: ${provider}`);
    this.name = 'UnsupportedProviderError';
  }
}

export class MissingApiKeyError extends ContentReviewerError {
  constructor(envVarName: string) {
    super(
      `API key not found. Please set ${envVarName} environment variable or provide it in the configuration.`
    );
    this.name = 'MissingApiKeyError';
  }
}

export class MissingFactCheckInstructionError extends ContentReviewerError {
  constructor() {
    super('factCheckInstruction is required when fact-checking is enabled.');
    this.name = 'MissingFactCheckInstructionError';
  }
}

export class MissingFactCheckToolsError extends ContentReviewerError {
  constructor() {
    super('Fact-check tools are unavailable for the selected provider.');
    this.name = 'MissingFactCheckToolsError';
  }
}

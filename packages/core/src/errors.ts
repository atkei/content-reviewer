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

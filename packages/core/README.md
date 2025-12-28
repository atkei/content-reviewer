# @content-reviewer/core

An LLM-powered library for reviewing written content.

## Installation

```bash
npm install @content-reviewer/core
```

## Usage

```typescript
import { ContentReviewer, createReviewConfig, type Document } from '@content-reviewer/core';

// 1. Configuration
const config = createReviewConfig({
  language: 'ja',
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4.1-mini',
  },
});

// 2. Document Preparation
const document: Document = {
  rawContent: '# Article\n\nContent to review...',
  source: 'article.md',
};

// 3. Review
const reviewer = new ContentReviewer(config);
const result = await reviewer.review(document);

console.log(`Issues found: ${result.issues.length}`);
```

## API Reference

### `ContentReviewer`

The main class for performing reviews.

```typescript
class ContentReviewer {
  constructor(config: ReviewConfig);
  review(document: Document): Promise<ReviewResult>;
}
```

### `createReviewConfig(input: ReviewConfigInput): ReviewConfig`

Creates a complete configuration object with default values.

### Types

#### `ReviewConfig`

Configuration for the reviewer, including LLM settings, language, and instructions.

#### `Document`

Represents the content to be reviewed.

- `rawContent`: The text content.
- `source`: Identifier (e.g., file path).

#### `ReviewResult`

The outcome of a review.

- `issues`: Array of `ReviewIssue` objects.
- `summary`: AI-generated summary of the review.

## Custom Instructions

Instructions (including persona and guidelines) can be provided as a string.

```typescript
const config = createReviewConfig({
  instruction: 'You are a friendly editor. Check for typos and tone.',
  // ...
});
```

# Content Reviewer

An LLM-powered tool for reviewing written content. By default, it’s optimized for technical writing (e.g., blog posts, docs, guides), and you can customize it with instructions for any style or domain.

## Features

- Sensible defaults out of the box
- Custom instructions for consistent, team-specific review criteria
- Structured output with severity levels (error, warning, suggestion)
- Multiple LLM providers (OpenAI, Anthropic, Google)

## Quick Start

### CLI

```bash
export OPENAI_API_KEY="sk-..."
npx @content-reviewer/cli article.md
```

See [CLI Documentation](./packages/cli) for details.

### Library

```bash
npm install @content-reviewer/core
```

```typescript
import { ContentReviewer, createReviewConfig } from '@content-reviewer/core';

const config = createReviewConfig({
  language: 'en',
  llm: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
});

const reviewer = new ContentReviewer(config);
const result = await reviewer.review({
  rawContent: '# My Article\n\nContent here...',
  source: 'article.md',
});
```

See [Core Documentation](./packages/core) for API reference.

## Packages

| Package                                   | Description                               | Version                                                                                                             |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [@content-reviewer/cli](./packages/cli)   | Command-line interface for content review | [![npm](https://img.shields.io/npm/v/@content-reviewer/cli)](https://www.npmjs.com/package/@content-reviewer/cli)   |
| [@content-reviewer/core](./packages/core) | Core library for programmatic integration | [![npm](https://img.shields.io/npm/v/@content-reviewer/core)](https://www.npmjs.com/package/@content-reviewer/core) |

## GitHub Actions

Review docs in Pull Requests with [Content Reviewer Action](https://github.com/atkei/content-reviewer-action).

## Prerequisites

- Node.js >= 20.0.0
- API key for a supported LLM provider (OpenAI, Anthropic, or Google)

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT

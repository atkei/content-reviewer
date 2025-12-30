# Content Reviewer

An LLM-powered tool for reviewing written content. It comes with sensible defaults for technical writing (e.g., blog posts, docs, guides), and you can customize the review criteria to match your own standards.

## Features

- Sensible defaults out of the box for technical writing
- Customizable review criteria via instruction files
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

## Custom Instructions

You can provide your own review criteria via an instruction file. This **replaces** the default instructions, so include everything you want checked.

```bash
content-review article.md --instruction my-standards.md
```

### Example

```markdown
## error

- ...
- Product name must be "MyProduct" (not "myproduct")
- Code blocks must specify language

## warning

- ...
- Avoid "latest version" - use exact version numbers

## ignore (do NOT report)

- Passive voice
- Paragraph length
- Minor wording suggestions
```

## Packages

| Package                                   | Description                       | Version                                                                                                             |
| ----------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [@content-reviewer/cli](./packages/cli)   | Command-line interface            | [![npm](https://img.shields.io/npm/v/@content-reviewer/cli)](https://www.npmjs.com/package/@content-reviewer/cli)   |
| [@content-reviewer/core](./packages/core) | Core library for programmatic use | [![npm](https://img.shields.io/npm/v/@content-reviewer/core)](https://www.npmjs.com/package/@content-reviewer/core) |

## GitHub Actions

Automate reviews in Pull Requests with [Content Reviewer Action](https://github.com/atkei/content-reviewer-action).

## Prerequisites

- Node.js >= 20.0.0
- API key for OpenAI, Anthropic, or Google

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT

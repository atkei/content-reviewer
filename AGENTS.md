# Additional Conventions Beyond the Built-in Functions

As this project's AI coding tool, you must follow the additional conventions below, in addition to the built-in functions.

# Content Reviewer

An LLM-powered content review tool. Monorepo with two packages:

- `@content-reviewer/core` - Core library for programmatic use
- `@content-reviewer/cli` - Command-line interface

## Tech Stack

- TypeScript (strict mode)
- pnpm workspaces
- tsup (bundler)
- Vitest (testing)
- ESLint + Prettier (linting/formatting)
- Vercel AI SDK for LLM integration
- Zod for schema validation

## Development Workflow

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm lint       # Run ESLint
pnpm format     # Run Prettier
```

## Code Quality

- **Always run `pnpm lint` and `pnpm format` before committing**
- Follow ESLint and Prettier configurations without exceptions
- Fix lint errors immediately, do not suppress without justification

## Architecture Guidelines

- Use `Readonly<T>` for immutable data types
- Create custom error classes extending `ContentReviewerError`
- Use barrel exports (`index.ts`) for public APIs
- Use `.js` extension in imports (ESM compatibility)
- Place tests in `__tests__/` directories or `.test.ts` files

# @content-reviewer/cli

An LLM-powered CLI for reviewing written content.

## Installation

### Global Installation

```bash
npm install -g @content-reviewer/cli
```

### Using npx

```bash
npx @content-reviewer/cli article.md
```

## Quick Start

### 1. Set up an API key

Set environment variables in your shell:

```bash
# For OpenAI (default)
export OPENAI_API_KEY="sk-..."

# For Anthropic Claude
export ANTHROPIC_API_KEY="sk-ant-..."

# For Google
export GOOGLE_API_KEY="..."
```

Alternatively, pass the API key directly using the `--api-key` option:

```bash
content-review article.md --api-key "sk-..."
```

### 2. Review your content

```bash
content-review article.md
```

## Usage

```bash
content-review -h
```

### Examples

```bash
# Review in Japanese
content-review article.md --language ja

# Use Anthropic Claude
content-review article.md --provider anthropic --model claude-sonnet-4-5

# Use custom configuration
content-review article.md -c .reviewrc.json

# Save results to JSON file
content-review article.md -o review-results.json
```

## Configuration

Create a `.reviewrc.json` file in your project root:

```json
{
  "language": "en",
  "llm": {
    "provider": "openai",
    "model": "gpt-4.1-mini"
  }
}
```

### Custom Instructions

You can provide a custom instruction file to define your own review criteria:

```bash
content-review article.md --instruction my-standards.md
```

Or via config file:

```json
{
  "instructionFile": "./my-standards.md"
}
```

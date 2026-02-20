# Contributing

## File Naming Conventions

- **kebab-case** for all files: `weather-agent.ts`, `generate-agent.ts`
- **kebab-case** for directories: `src/mastra/agents/`

## Code Style

- TypeScript with strict mode
- ES modules only (`"type": "module"` in package.json)
- Path aliases: `@src/*` and `@mastra/*`
- Biome for linting and formatting

## Testing

- Tests live in `tests/` directory
- Use Bun's built-in test runner: `bun test`
- Test files: `*.test.ts`

## Scripts

- Utility scripts in `scripts/` directory
- Run with: `bun run scripts/<name>.ts`

## Linting & Formatting

This project uses **Biome** for fast, consistent linting and formatting.

```bash
# Check and auto-fix issues
bun run lint

# Check without fixing (CI mode)
bun run lint:check

# Format files
bun run format

# Type check only
bun run typecheck

# Run all checks (lint + typecheck)
bun run check

# Pre-commit check (lint + typecheck + tests)
bun run precommit
```

## Pre-commit Hook

A pre-commit hook is installed automatically. To bypass when needed:

```bash
git commit --no-verify
```

Or run checks manually before committing:

```bash
bun run precommit
```

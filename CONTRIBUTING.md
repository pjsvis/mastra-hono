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

# Run all checks (lint check + typecheck)
bun run check

# Pre-commit suite (lint write + typecheck)
bun run precommit

# Full verification (lint check + typecheck + tests)
bun run verify
```

## Pre-commit Hook

A pre-commit hook is installed automatically to keep the codebase healthy without being a bottleneck. It runs:
1. `biome check --write`: Automatically formats and fixes common lint issues.
2. `tsc --noEmit`: Ensures type-safety across the project.

**Note**: Heavy tests are excluded from the pre-commit hook to keep it fast. You should run `bun run verify` before pushing to a remote branch.

To bypass when needed:

```bash
git commit --no-verify
```

Or run checks manually before committing:

```bash
bun run precommit
```

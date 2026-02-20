# Contributing

## File Naming Conventions

- **kebab-case** for all files: `weather-agent.ts`, `generate-agent.ts`
- **kebab-case** for directories: `src/mastra/agents/`

## Code Style

- TypeScript with strict mode
- ES modules only (`"type": "module"` in package.json)
- Path aliases: `@src/*` and `@mastra/*`

## Testing

- Tests live in `tests/` directory
- Use Bun's built-in test runner: `bun test`
- Test files: `*.test.ts`

## Scripts

- Utility scripts in `scripts/` directory
- Run with: `bun run scripts/<name>.ts`

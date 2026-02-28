# Source Code (`src/`)

This directory contains all application source code for the Mastra Hono agent framework.

## Structure

| Directory | Purpose |
|-----------|---------|
| [`cli/`](cli/README.md) | Command-line interface for interacting with agents |
| [`lib/`](lib/README.md) | Shared libraries (secrets management) |
| [`mastra/`](mastra/README.md) | Mastra core: agents, tools, workflows |
| [`utils/`](utils/README.md) | Utility functions |

## Entry Points

### Server
```bash
bun run dev     # Development server (http://hono.localhost:1355)
bun run build   # Production build
bun run start  # Start production server
```

### CLI
```bash
bun run cli agent run <agentId> --prompt "your prompt"
bun run cli agent chat <agentId>
```

## Architecture

```
src/
├── index.ts          # Hono server entry point
├── cli/              # Agent CLI (citty-based)
├── lib/              # Secrets management via Skate
├── mastra/           # Agents, tools, workflows
└── utils/            # Shared utilities
```

See individual directory READMEs for details.

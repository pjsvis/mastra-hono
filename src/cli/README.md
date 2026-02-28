# CLI (`src/cli/`)

Command-line interface for interacting with Mastra agents. Built with [citty](https://github.com/unjs/citty).

## Usage

```bash
# Run a single prompt
bun run cli agent run <agentId> --prompt "your prompt"

# Interactive chat
bun run cli agent chat <agentId>

# With model override
bun run cli agent chat researchAgent --model openai/gpt-4o
```

## Available Agents

| Agent ID | Description |
|----------|-------------|
| `edinburghProtocolAgent` | Scottish Enlightenment reasoning |
| `localMemoryAgent` | Observational memory learning |
| `researchAgent` | Web search and calculations |
| `weatherAgent` | Weather queries |

## Commands

### `agent run`
Execute a single prompt and exit.

```bash
bun run cli agent run researchAgent --prompt "What's 15% of 250?"
```

### `agent chat`
Start an interactive REPL session.

```bash
bun run cli agent chat researchAgent
```

Type `exit` or `quit` to end the session.

## Structure

```
cli/
├── index.ts           # Entry point (citty runMain)
├── commands/
│   ├── agent.ts       # Parent command (agent run|chat)
│   ├── run.ts        # Single prompt execution
│   └── chat.ts       # Interactive REPL
```

## Adding Commands

See [citty documentation](https://github.com/unjs/citty) for adding new commands.

```typescript
// commands/my-command.ts
import { defineCommand } from 'citty';

export const myCommand = defineCommand({
  meta: {
    name: 'my-command',
    description: 'What it does',
  },
  args: {
    input: { type: 'positional', required: true },
  },
  async run({ args }) {
    // Command logic
  },
});
```

Then register in [`index.ts`](index.ts):

```typescript
subCommands: {
  myCommand,
}
```

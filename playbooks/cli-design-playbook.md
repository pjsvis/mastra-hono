---
name: cli-design
description: Design patterns and standards for building CLI tools in the Mastra-Hono project.
allowed-tools: Bash(node), Bash(bun)
---

# CLI Design Playbook

## Purpose

This playbook defines the design patterns and standards for building CLI tools in the Mastra-Hono project, ensuring consistency, type safety, and maintainability.

## Technology Stack

- **Runtime**: Bun (v1.3+)
- **CLI Framework**: [citty](https://github.com/unjs/citty) by UnJS
- **Parsing**: Native `util.parseArgs` for basic cases, citty for complex CLIs
- **Language**: TypeScript (strict mode)

## When to Use citty vs Native `util.parseArgs`

| Scenario | Recommended | Reason |
|----------|-------------|--------|
| Single-command tool | `util.parseArgs` | Minimal overhead, built-in |
| Multiple subcommands | **citty** | Declarative structure, auto-help |
| Type-safe args | **citty** | Inferred types from definition |
| POSIX-compliant | **citty** | Built-in validations |
| Auto-generated help | **citty** | Zero-effort documentation |

## Mandatory Directives

### 1. Command Structure

Define a clear hierarchy using nested `defineCommand` calls:

```typescript
// src/cli/index.ts
import { defineCommand, runMain } from 'citty';

const main = defineCommand({
  meta: {
    name: 'mastra-cli',
    version: '0.1.0',
    description: 'Mastra Agent CLI - Interact with your AI agents',
  },
  subCommands: {
    agent: agentCommand,  // Subcommand definitions
  },
});

runMain(main);
```

### 2. Arg Definition Pattern

Always use descriptive arg definitions with types and aliases:

```typescript
const myCommand = defineCommand({
  meta: {
    name: 'run',
    description: 'Execute a single prompt and exit',
  },
  args: {
    agent: {
      type: 'positional',
      required: true,
      description: 'The agent ID to use',
    },
    prompt: {
      type: 'string',
      description: 'The prompt to send to the agent',
      alias: 'p',
      required: true,
    },
    model: {
      type: 'string',
      description: 'Override the default model',
      alias: 'm',
    },
  },
  async run({ args }) {
    // Args are fully typed here
    const { agent, prompt, model } = args;
    // ...
  },
});
```

### 3. Handler Structure

Keep handlers clean and focused:

```typescript
async run({ args }) {
  // 1. Extract and validate args
  const agentId = args.agent as AgentId;
  
  // 2. Validate business logic
  if (!isValidAgent(agentId)) {
    console.error(`❌ Error: Unknown agent ID "${agentId}"`);
    process.exit(1);
  }
  
  // 3. Execute
  await executeCommand(agentId, args);
}
```

### 4. Error Handling

Use exit codes consistently:

| Exit Code | Meaning |
|-----------|---------|
| `0` | Success |
| `1` | General error / validation failure |
| `2` | Missing required argument |
| `127` | Command not found |

### 5. Output Formatting

Use emoji prefixes for consistent UX:

```typescript
console.log(`✅ Success: ${message}`);
console.error(`❌ Error: ${message}`);
console.warn(`⚠️ Warning: ${message}`);
console.info(`ℹ️ Info: ${message}`);
```

### 6. Help Text Quality

Ensure every command has:

```typescript
meta: {
  name: 'command-name',
  description: 'Clear, one-sentence description',
}
args: {
  myArg: {
    type: 'string',
    description: 'What this arg does and what values are accepted',
  },
}
```

## Integration Patterns

### Pattern 1: Subcommand Delegation

Delegate to subcommand modules for maintainability:

```typescript
// src/cli/commands/agent.ts
import { runCommand } from './run';
import { chatCommand } from './chat';

export const agentCommand = defineCommand({
  meta: { name: 'agent', description: 'Agent commands' },
  subCommands: {
    run: runCommand,
    chat: chatCommand,
  },
});
```

### Pattern 2: Shared Arguments

Export reusable arg definitions:

```typescript
// src/cli/commands/agent.ts
export const modelArg = {
  type: 'string' as const,
  description: 'Override the default model',
  alias: 'm',
};

// In consumer:
args: {
  model: modelArg,
}
```

### Pattern 3: External Tool Integration

When spawning external tools (like `gum`):

```typescript
const spinner = spawn(
  'gum',
  ['spin', '--spinner', 'dot', '--title', 'Thinking...', '--', 'sleep', '10000'],
  { stdio: 'inherit' }
);

// Always clean up on error
try {
  result = await agent.generate(prompt);
} finally {
  spinner.kill();
  process.stdout.write('\r\x1b[K'); // Clear spinner line
}
```

## Testing CLI Commands

Test commands in isolation:

```bash
# Test help generation
bun run cli --help

# Test subcommand help
bun run cli agent --help
bun run cli agent run --help

# Test validation
bun run cli agent run  # Should error: missing agent ID
```

## Type Safety Requirements

1. All args must be typed (citty handles this automatically)
2. Validate positional args with type guards:
   ```typescript
   const agentId = args.agent as AgentId;
   if (!agentIds.includes(agentId)) { /* ... */ }
   ```
3. Use `const` assertions for shared arg definitions

## Performance Considerations

- citty is ~5KB - minimal bundle impact
- Lazy loading: subcommands only load their imports
- Bun's fast startup keeps CLI snappy

## Migration from `util.parseArgs`

1. Identify subcommand boundaries
2. Create `src/cli/commands/<name>.ts` for each subcommand
3. Move arg definitions to `args` property
4. Convert validation logic to the `run` function
5. Wire up in parent via `subCommands`
6. Remove manual `parseArgs` calls and routing

## Dependencies

```json
{
  "dependencies": {
    "citty": "^0.2.0"
  }
}
```

## Compliance Checklist

- [ ] Uses `defineCommand` for all commands
- [ ] Has descriptive `meta.name` and `meta.description`
- [ ] All args have `description`
- [ ] Positional args use `type: 'positional'`
- [ ] Optional string args use `type: 'string'`
- [ ] Boolean flags use `type: 'boolean'`
- [ ] Aliases defined with `alias` property
- [ ] Required args marked with `required: true`
- [ ] Business validation in `run` function
- [ ] Proper exit codes used
- [ ] Error messages use emoji prefixes

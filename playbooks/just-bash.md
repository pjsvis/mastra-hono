# Just-Bash Playbook

## Purpose
`just-bash` provides a simulated, secure, and sandboxed Bash environment with an in-memory virtual filesystem. It is designed for AI agents to execute commands safely without risking the host system.

## Key Features
- **Sandboxed Execution:** Isolated from the host filesystem and environment.
- **Virtual Filesystem:** Supports `InMemoryFs`, `OverlayFs`, and `MountableFs`.
- **Resource Limits:** Configurable limits for execution time and depth to prevent infinite loops.
- **Tool Integration:** Optimized for AI SDKs via `bash-tool`.

## Usage Guidelines

### 1. Installation
```bash
npm install just-bash
```

### 2. Basic API Usage (TypeScript)
Use `just-bash` when you need to run shell commands in a controlled environment.

```typescript
import { Bash } from "just-bash";

const bash = new Bash({
  files: {
    "hello.txt": "Hello, World!",
  },
});

const result = await bash.exec("cat hello.txt && echo ' Append' >> hello.txt");
console.log(result.stdout); // "Hello, World!
"
```

### 3. Filesystem Modes
- **InMemoryFs (Default):** Everything is in memory, lost when the `Bash` instance is destroyed.
- **OverlayFs:** Read-only view of a real directory, with writes staying in memory. Great for agents exploring a codebase without making permanent changes.
- **ReadWriteFs:** Direct access to a directory (use with caution).

### 4. Security & Network
Network access is disabled by default. If needed, configure allowed prefixes:
```typescript
const bash = new Bash({
  network: {
    allowedUrlPrefixes: ["https://api.github.com"],
    allowedMethods: ["GET"],
  },
});
```

### 5. Integration with Mastra / AI Agents
When building Mastra tools that require shell execution, wrap them in `just-bash` for safety.

```typescript
import { createTool } from '@mastra/core/tools';
import { Bash } from 'just-bash';

export const safeShellTool = createTool({
  id: 'safe-shell',
  description: 'Execute bash commands safely',
  // ... schema ...
  execute: async ({ inputData }) => {
    const bash = new Bash();
    return await bash.exec(inputData.command);
  },
});
```

## Best Practices
- **Persistence:** The filesystem persists across `exec()` calls on the same `Bash` instance.
- **Isolation:** Use a new `Bash` instance for unrelated tasks to ensure a clean state.
- **Limits:** Always set `executionLimits` when running untrusted or complex scripts.

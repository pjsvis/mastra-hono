---
id: PB-012
title: "Just-Bash Playbook"
role: "Build"
infrastructure: [bash]
last_updated: "2026-03-21"
tags: [playbook]
---

# Just-Bash Playbook

## Purpose
`just-bash` provides a simulated, secure, and sandboxed Bash environment with an in-memory virtual filesystem. It is designed for AI agents to execute commands safely without risking the host system. This playbook provides comprehensive guidelines for using just-bash in development workflows, particularly for testing shell logic and integrating with AI agents.

**Core Philosophy:** Execute shell commands safely in a sandboxed environment. Test logic before running on the host system. Use virtual filesystems for isolated experimentation without permanent changes.


## Key Features

- **Sandboxed Execution:** Isolated from the host filesystem and environment
- **Virtual Filesystem:** Supports `InMemoryFs`, `OverlayFs`, and `MountableFs`
- **Resource Limits:** Configurable limits for execution time and depth to prevent infinite loops
- **Tool Integration:** Optimized for AI SDKs via `bash-tool`
- **Network Control:** Disabled by default, configurable with allowed prefixes
- **Persistence:** Filesystem persists across `exec()` calls on the same instance

## Usage Guidelines

### Installation

```bash
npm install just-bash
```

### Basic API Usage (TypeScript)

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

**What this does:**
- Creates a new Bash instance with an in-memory filesystem
- Pre-populates the filesystem with a file
- Executes commands that read and modify the file
- Returns the result with stdout, stderr, and exit code

### Filesystem Modes

Choose the appropriate filesystem mode for your use case:

| Mode | Description | Use Case |
|------|-------------|----------|
| **InMemoryFs** (Default) | Everything is in memory, lost when the `Bash` instance is destroyed | Temporary testing, isolated operations |
| **OverlayFs** | Read-only view of a real directory, with writes staying in memory | Exploring codebase without permanent changes |
| **ReadWriteFs** | Direct access to a directory | Production use (use with caution) |

**InMemoryFs Example:**
```typescript
const bash = new Bash({
  files: {
    "test.txt": "content"
  }
});
// All changes are lost when bash is destroyed
```

**OverlayFs Example:**
```typescript
const bash = new Bash({
  fs: new OverlayFs({
    base: "/path/to/real/directory"
  })
});
// Reads from real directory, writes to memory
```

### Security & Network

Network access is disabled by default. If needed, configure allowed prefixes:

```typescript
const bash = new Bash({
  network: {
    allowedUrlPrefixes: ["https://api.github.com"],
    allowedMethods: ["GET"],
  },
});
```

**Why network is disabled by default:**
- Prevents data exfiltration
- Blocks unauthorized API calls
- Reduces attack surface
- Ensures predictable behavior

### Integration with Mastra / AI Agents

When building Mastra tools that require shell execution, wrap them in `just-bash` for safety.

```typescript
import { createTool } from '@mastra/core/tools';
import { Bash } from 'just-bash';

export const safeShellTool = createTool({
  id: 'safe-shell',
  description: 'Execute bash commands safely',
  inputSchema: z.object({
    command: z.string().describe('The bash command to execute')
  }),
  outputSchema: z.object({
    stdout: z.string(),
    stderr: z.string(),
    exitCode: z.number()
  }),
  execute: async ({ inputData }) => {
    const bash = new Bash();
    const result = await bash.exec(inputData.command);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode
    };
  },
});
```

**Benefits:**
- Safe execution of shell commands by AI agents
- Prevents accidental damage to host system
- Provides clear error messages
- Enables testing of shell logic

## Best Practices

### 1. Use New Instances for Unrelated Tasks

Use a new `Bash` instance for unrelated tasks to ensure a clean state.

```typescript
// Good
const bash1 = new Bash();
await bash1.exec("command1");

const bash2 = new Bash();
await bash2.exec("command2");

// Bad
const bash = new Bash();
await bash.exec("command1");
// State from command1 affects command2
await bash.exec("command2");
```

**Why:** Prevents state pollution between unrelated operations.

### 2. Always Set Execution Limits

Always set `executionLimits` when running untrusted or complex scripts.

```typescript
const bash = new Bash({
  executionLimits: {
    maxExecutionTime: 5000,  // 5 seconds
    maxDepth: 1000,           // Prevent infinite loops
  }
});
```

**Why:** Prevents infinite loops and resource exhaustion.

### 3. Test Before Production Execution

Use just-bash to test shell logic safely before running on the host system.

```typescript
// Test in sandbox
const bash = new Bash();
const result = await bash.exec(testCommand);

// Verify result
if (result.exitCode === 0) {
  // Run on host
  execSync(realCommand);
}
```

**Why:** Catches errors before they affect the host system.

### 4. Use OverlayFs for Codebase Exploration

Use `OverlayFs` when exploring a codebase without making permanent changes.

```typescript
const bash = new Bash({
  fs: new OverlayFs({
    base: "/path/to/project"
  })
});

// Explore without modifying
await bash.exec("grep -r 'TODO' src/");
```

**Why:** Allows safe exploration without risk of accidental changes.

### 5. Validate Output Before Using

Always validate command output before using it in production.

```typescript
const result = await bash.exec("ls -la");

// Validate before using
if (result.exitCode === 0 && result.stdout) {
  const files = parseLsOutput(result.stdout);
  // Use files...
}
```

**Why:** Prevents errors from propagating to production.

## Real-World Example: Worktree Cleanup

### The Problem

After merging PRs, we need to safely remove worktrees for merged branches while:
- Preserving the main branch
- Leaving unmerged branches alone
- Not touching detached worktrees

### Testing Strategy

We use just-bash to simulate git output and verify our parsing logic works correctly:

```typescript
import { Bash } from "just-bash";

const bash = new Bash();

// Simulate git worktree list --porcelain output
const result = await bash.exec(`
cat <<'EOF'
worktree /repo
HEAD 1111111111111111111111111111111111111111
branch refs/heads/main

worktree /repo/.worktrees/feature-123
HEAD 2222222222222222222222222222222222222222
branch refs/heads/feature/123

worktree /repo/.worktrees/detached
HEAD 3333333333333333333333333333333333333333
branch (detached)
EOF'
`);

// Parse and validate cleanup logic
const worktrees = parseWorktreeListPorcelain(result.stdout);
const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
  mergedBranches: ["main", "feature/123"],
  worktrees,
});

console.log("Would remove:", worktreesToRemove);
console.log("Would delete:", branchesToDelete);
```

### Key Benefits

- **Safety:** Test parsing logic without touching actual worktrees
- **Reproducibility:** Heredoc fixtures provide consistent test data
- **Speed:** In-memory execution is faster than real git operations
- **Coverage:** Easy to test edge cases (detached, special characters, empty state)

### When to Use This Pattern

Use just-bash for testing any shell logic that involves:
- Parsing structured output (e.g., `git --porcelain`, `jq` results)
- File manipulation or path operations
- Complex conditionals or loops
- Operations that would be dangerous to test on live data

### Production Execution

After validating logic with just-bash, the actual cleanup script runs on the host system with a `--dry-run` flag:

```bash
# Preview what would be cleaned
./scripts/worktree-cleanup.sh --dry-run

# Execute the cleanup
./scripts/worktree-cleanup.sh --execute
```

This two-phase approach (sandbox test → dry-run → execute) provides maximum safety for destructive operations.

## Common Pitfalls

### Pitfall 1: Reusing Instances for Unrelated Tasks

**Problem:** Reusing the same `Bash` instance for unrelated tasks causes state pollution.

```typescript
// Bad
const bash = new Bash();
await bash.exec("cd /tmp");
await bash.exec("ls");  // Still in /tmp
```

**Solution:** Use new instances for unrelated tasks.

```typescript
// Good
const bash1 = new Bash();
await bash1.exec("cd /tmp");

const bash2 = new Bash();
await bash2.exec("ls");  // In root
```

### Pitfall 2: Not Setting Execution Limits

**Problem:** Unbounded execution can cause infinite loops or resource exhaustion.

```typescript
// Bad
const bash = new Bash();
await bash.exec("while true; do echo 'loop'; done");  // Never ends
```

**Solution:** Always set execution limits.

```typescript
// Good
const bash = new Bash({
  executionLimits: {
    maxExecutionTime: 5000,
    maxDepth: 1000
  }
});
await bash.exec("while true; do echo 'loop'; done");  // Times out
```

### Pitfall 3: Assuming Persistence Across Instances

**Problem:** Assuming files persist across different `Bash` instances.

```typescript
// Bad
const bash1 = new Bash();
await bash1.exec("echo 'test' > file.txt");

const bash2 = new Bash();
await bash2.exec("cat file.txt");  // File doesn't exist!
```

**Solution:** Files only persist within the same instance.

```typescript
// Good
const bash = new Bash();
await bash.exec("echo 'test' > file.txt");
await bash.exec("cat file.txt");  // File exists
```

### Pitfall 4: Forgetting to Validate Output

**Problem:** Using command output without validation.

```typescript
// Bad
const result = await bash.exec("some-command");
const data = JSON.parse(result.stdout);  // May throw
```

**Solution:** Always validate output before using.

```typescript
// Good
const result = await bash.exec("some-command");
if (result.exitCode === 0 && result.stdout) {
  const data = JSON.parse(result.stdout);
}
```

### Pitfall 5: Using ReadWriteFs Without Caution

**Problem:** Using `ReadWriteFs` can modify the host filesystem.

```typescript
// Bad
const bash = new Bash({
  fs: new ReadWriteFs("/path/to/important/directory")
});
await bash.exec("rm -rf *");  // Deletes real files!
```

**Solution:** Use `InMemoryFs` or `OverlayFs` unless absolutely necessary.

```typescript
// Good
const bash = new Bash({
  fs: new OverlayFs({
    base: "/path/to/important/directory"
  })
});
await bash.exec("rm -rf *");  // Only affects memory
```

## References

- [just-bash Documentation](https://github.com/yourusername/just-bash) – Official just-bash documentation
- [Secure Tool Design Playbook](./secure-tool-design.md) – Designing secure tools for agents
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team

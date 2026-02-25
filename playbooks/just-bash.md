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
- **Testing:** Use just-bash to test shell logic safely before running on the host system.

## Real-World Example: Worktree Cleanup

A common workflow pattern is testing git operations in a sandbox before running them on your actual repository. Here's how we use just-bash to test worktree cleanup logic:

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

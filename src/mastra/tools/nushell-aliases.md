# Nushell Aliases for Common Tasks

This file defines a set of reusable aliases that simplify frequent operations in the Mastra project.  
All aliases are written in **Nushell** (nu) syntax and can be added to your `config.nu` or imported via a separate module.

## Alias Overview

### Task Management (td)

| Alias | Command | Description |
|-------|---------|-------------|
| `tdu` | `td usage --new-session` | Start a new task session. |
| `tdl` | `td list` | List all tasks. |
| `station-status` | `td current --json \| from json \| get focused.issue` | Show the focused task as JSON. |
| `td-foc` | `td focus <issue-id>` | Focus a specific task. |
| `td-unfoc` | `td unfocus` | Clear any focused task. |
| `td-open` | `td list --json \| from json \| where status == "open"` | List open tasks. |
| `td-inprog` | `td list --json \| from json \| where status == "in_progress"` | List in‑progress tasks. |
| `td-review` | `td list --json \| from json \| where status == "in_review"` | List tasks awaiting review. |
| `td-all` | `td list --json \| from json` | List all tasks. |
| `td-summary` | `td list --json \| from json \| select id title status priority` | Quick summary table of tasks. |

### PR Monitoring

| Alias | Command | Description |
|-------|---------|-------------|
| `pr-state` | `open ~/.ctx/pr-watch-state.json \| from json` | Read PR monitoring state. |
| `pr-issues` | `pr-state \| get issues \| table` | Show PR issues as table. |
| `pr-errors` | `pr-state \| get issues \| where severity == "error"` | Show only error-level issues. |
| `pr-pending` | `pr-state \| get issues \| where severity != "info"` | Show warnings and errors. |

### Skate (Secrets)

| Alias | Command | Description |
|-------|---------|-------------|
| `skg` | `skate get` | Retrieve the current skate session. |
| `sk-set` | `skate set <value>` | Set a skate configuration value. |
| `sk-del` | `skate delete <key>` | Delete a skate configuration key. |

### Git

| Alias | Command | Description |
|-------|---------|-------------|
| `td-commits` | `git log --oneline --decorate --graph` | Show recent git commits in a concise format. |
| `td-clean` | `git clean -fdx` | Remove untracked files. |
| `td-status` | `git status` | Show current git status. |
| `td-branch` | `git branch --show-current` | Show the current branch. |

## How to Add These Aliases

1. **Create a module file** (e.g., `nushell-aliases.nu`) and paste the alias definitions below.
2. **Import the module** in your `config.nu` with `source ~/.config/nushell/config.nu` or `source nushell-aliases.nu`.

## Alias Definitions

```nu
# nushell-aliases.nu

# ══════════════════════════════════════════════════════════════════════════════
# TASK MANAGEMENT (td)
# ══════════════════════════════════════════════════════════════════════════════

alias tdu = "td usage --new-session"
alias tdl = "td list"
alias td-foc = "td focus"
alias td-unfoc = "td unfocus"

# Focused task snapshot
alias station-status = "td current --json | from json | get focused.issue"

# Task filters
alias td-open = "td list --json | from json | where status == \"open\""
alias td-inprog = "td list --json | from json | where status == \"in_progress\""
alias td-review = "td list --json | from json | where status == \"in_review\""
alias td-all = "td list --json | from json"
alias td-summary = "td list --json | from json | select id title status priority"

# ══════════════════════════════════════════════════════════════════════════════
# PR MONITORING
# See ~/.pi/agent/extensions/pr-review-loop/ for the extension
# ══════════════════════════════════════════════════════════════════════════════

alias pr-state = "open ~/.ctx/pr-watch-state.json | from json"
alias pr-issues = "pr-state | get issues | table"
alias pr-errors = "pr-state | get issues | where severity == \"error\""
alias pr-pending = "pr-state | get issues | where severity != \"info\""

# ══════════════════════════════════════════════════════════════════════════════
# SKATE (Secrets)
# ══════════════════════════════════════════════════════════════════════════════

alias skg = "skate get"
alias sk-set = "skate set"
alias sk-del = "skate delete"

# ══════════════════════════════════════════════════════════════════════════════
# GIT
# ══════════════════════════════════════════════════════════════════════════════

alias td-commits = "git log --oneline --decorate --graph"
alias td-clean = "git clean -fdx"
alias td-status = "git status"
alias td-branch = "git branch --show-current"
```

## Usage Tips

- **Combining commands**: Pipe the output of an alias into other NuShell commands for further transformation, e.g., `td-open | from json | select id title | to json`.
- **Error handling**: Use `try`/`catch` around aliases that may fail (e.g., `td-foc` if the issue ID does not exist).
- **Extensibility**: Add new aliases as needed; keep them grouped logically for readability.

---

## Data-First Architecture

**Principle:** Emit JSON → Transform with NuShell → Render anywhere

Every tool should output structured JSON. Nushell is the universal transform layer:

```
┌──────────────┐    ┌─────────┐    ┌──────────┐
│   TOOL       │───▶│  JSON   │───▶│ NuShell  │
│   (emits)    │    │  STATE  │    │(transform)│
└──────────────┘    └─────────┘    └──────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
               ┌─────────┐      ┌───────────┐    ┌──────────┐
               │  TABLE  │      │  CHART    │    │   SSE    │
               │(console)│      │(terminal) │    │  (web)   │
               └─────────┘      └───────────┘    └──────────┘
```

## Bun Daemon Pattern

For long-running workflows, create a Bun executable daemon:

```typescript
// scripts/daemon/pr-watcher.ts
#!/usr/bin/env bun

import { existsSync, watch } from 'fs';

// Watch state file and emit on change
const stateFile = resolve(homeDir(), '.ctx/pr-watch-state.json');

watch(stateFile, () => {
  if (existsSync(stateFile)) {
    const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    // Transform and emit
    console.log(JSON.stringify(transform(state)));
  }
});
```

**Run as daemon:**
```bash
bun run --watch scripts/daemon/pr-watcher.ts
```

**Or as SSE server:**
```typescript
// scripts/daemon/pr-sse.ts
app.get('/sse/pr-status', (c) => {
  return streamSSE(c, async (stream) => {
    while (true) {
      const state = loadState();
      await stream.write(JSON.stringify(state));
      await sleep(5000);
    }
  });
});
```

---

**Note**: Ensure that the `td` and `skate` binaries are available in your PATH when using these aliases.

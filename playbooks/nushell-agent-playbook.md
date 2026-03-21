date: 2026-03-21
tags: [playbook, nushell, agent, workflow, td, structured-data, shell]
agent: local-ai
environment: development
version: 1.0
last_updated: 2026-03-21
---

# Nushell Agent Playbook

## Purpose
Use Nushell (`nu`) as a **sensory layer** to extract structured truth from `td` and related tools. This playbook defines the two operating modes and the approved usage patterns for agents working with task state and structured data.

**Core Philosophy:** Prefer structured data (JSON/tables) over raw text. Use Nushell transforms to extract and manipulate data without coupling to storage implementations.

**Core Principles:**
1. **Structured over textual**: Prefer JSON/table output and transform it in `nu`.
2. **No DB coupling**: Do not read `td` databases directly; use `td --json`.
3. **Repeatable rituals**: Start sessions consistently and keep commands short.

## Table of Contents

- [Purpose](#purpose)
- [Table of Contents](#table-of-contents)
- [Modes of Use](#modes-of-use)
  - [Mode 1: Everyday Mode (Shortcuts)](#mode-1-everyday-mode-shortcuts)
  - [Mode 2: Development Mode (Tooling)](#mode-2-development-mode-tooling)
- [Approved Integration Rules](#approved-integration-rules)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [References](#references)

## Modes of Use

Nushell operates in two distinct modes depending on the context and requirements of the task.

### Mode 1: Everyday Mode (Shortcuts)

Use for daily task flow and quick status checks. This mode prioritizes speed and convenience.

#### Primary Shortcuts

| Shortcut | Command | Purpose |
|----------|---------|---------|
| `tdu` | `td usage --new-session` | Initialize new session |
| `tdl` | `td list` | List all tasks |
| `station-status` | Custom alias | Focused task as structured output |
| `skg` | `skate get` | Get secret values |

#### Core Commands

**Focused task snapshot:**
```nu
td current --json | from json | get focused.issue
```

**Focused task detail:**
```nu
station-status | to json
```

**Active tasks view:**
```nu
td list --json | from json | where status in ["open", "in_progress", "in_review"] | select id title status priority updated_at | sort-by updated_at | table
```

**Review queue:**
```nu
td list --json | from json | where status == "in_review" | select id title implementer_session | table
```

#### Everyday Examples

**Compact focused task:**
```nu
td current --json | from json | get focused.issue | select id title status | to json
```

**Open tasks sorted by priority:**
```nu
td list --json | from json | where status == "open" | sort-by priority | select id title priority | table
```

**Keyword scan:**
```nu
td list --json | from json | where title =~ "nushell" | select id title status | to json
```

**When to use Everyday Mode:**
- Quick status checks during development
- Reviewing task lists and priorities
- Extracting focused task information
- Simple filtering and sorting operations

### Mode 2: Development Mode (Tooling)

Use when creating or refining Nushell functions/aliases. This mode prioritizes correctness and maintainability.

#### Workflow

1. **Edit configuration:**
   ```nu
   # Edit your Nushell config
   ~/.config/nushell/config.nu
   ```

2. **Re-source config:**
   ```nu
   source ~/.config/nushell/config.nu
   ```

3. **Validate output shape:**
   ```nu
   # Inspect current task structure
   td current --json | from json | to json
   
   # Inspect list item structure
   td list --json | from json | first | to json
   ```

#### `station-status` Design

The `station-status` alias is designed to provide structured output about the focused task:

**Implementation:**
1. Pull focused issue id from `td current --json`
2. Filter `td list --json` by id
3. Return structured output (table/JSON)

**Expected output structure:**
```json
{
  "id": "task-id",
  "title": "Task title",
  "status": "in_progress",
  "priority": "high",
  "updated_at": "2026-03-21T10:00:00Z"
}
```

**When to use Development Mode:**
- Creating new Nushell functions or aliases
- Debugging existing functions
- Validating data structures
- Testing transformations before deployment

## Approved Integration Rules

### What TO Do

✅ **Use `td --json` for all data access**
- Never read `td` databases directly
- Always use the CLI with JSON output
- Transform data in Nushell, not at the source

✅ **Prefer structured output**
- Use `to json` for machine-readable output
- Use `table` for human-readable output
- Avoid raw text parsing

✅ **Keep commands short and focused**
- Break complex operations into steps
- Use pipes for data flow
- Store intermediate results in variables if needed

### What NOT to Do

❌ **Do not change the system shell**
- Nushell is an auxiliary tool, not a replacement
- Do not configure it as the default login shell
- Use it alongside your existing shell

❌ **Do not couple to `td` storage paths**
- Never read `.td/` or `~/.td/` directories
- Never parse `td` database files directly
- Always use the CLI interface

❌ **Do not use raw text parsing**
- Avoid `grep` and `sed` on JSON output
- Use Nushell's structured data operations
- Parse JSON with `from json`, not regex

## Troubleshooting

### Common Issues

#### `station-status` returns nothing

**Symptoms:**
```nu
station-status
# Returns empty or error
```

**Diagnosis:**
1. Ensure a task is focused:
   ```nu
   td focus <issue-id>
   ```

2. Verify focused task exists:
   ```nu
   td current --json | from json | get focused
   ```

3. Re-source config:
   ```nu
   source ~/.config/nushell/config.nu
   ```

**Solution:**
- Focus a task before using `station-status`
- Verify the alias is defined in your config
- Check for typos in the alias definition

#### Field not found error

**Symptoms:**
```nu
td current --json | from json | get focused.issue
# Error: field not found
```

**Diagnosis:**
1. Inspect the actual structure:
   ```nu
   td current --json | from json | to json
   ```

2. Inspect list sample:
   ```nu
   td list --json | from json | first | to json
   ```

**Solution:**
- Verify the field name matches the actual structure
- Use `get` with default values:
  ```nu
  td current --json | from json | get focused.issue | default null
  ```
- Update aliases if the structure has changed

#### JSON parsing errors

**Symptoms:**
```nu
td list --json | from json
# Error: cannot parse JSON
```

**Diagnosis:**
1. Check raw output:
   ```nu
   td list --json
   ```

2. Verify JSON validity:
   ```nu
   td list --json | from json | is-empty
   ```

**Solution:**
- Ensure `td` is outputting valid JSON
- Check for non-JSON output mixed in
- Filter out non-JSON lines before parsing

## Best Practices

### 1. Always Start with `td usage --new-session`

Before any work, initialize your session:
```nu
tdu  # or td usage --new-session
```

**Why:** This ensures your session ID is set and you have the current "Work Territory" map.

### 2. Use Aliases for Common Operations

Define aliases for frequently used commands:
```nu
alias tdu = td usage --new-session
alias tdl = td list
alias station-status = { td current --json | from json | get focused.issue }
```

**Why:** Reduces typing and ensures consistency across sessions.

### 3. Validate Output Structures

Before using data, inspect its structure:
```nu
td current --json | from json | to json
```

**Why:** Prevents errors from unexpected field names or structures.

### 4. Prefer Pipes Over Variables

Use pipes for data flow:
```nu
td list --json | from json | where status == "open" | table
```

**Why:** More readable and follows Nushell's functional paradigm.

### 5. Test Transformations Interactively

Before using a transformation in a script, test it interactively:
```nu
# Test the transformation
td list --json | from json | first | select id title status

# Then use it in your workflow
```

**Why:** Catches errors early and ensures the transformation works as expected.

### 6. Keep Functions Small

Break complex operations into smaller functions:
```nu
def get-focused-task [] {
  td current --json | from json | get focused.issue
}

def get-open-tasks [] {
  td list --json | from json | where status == "open"
}
```

**Why:** Easier to test, debug, and reuse.

## Examples

### Example 1: Extract Task Summary

```nu
# Get a summary of the focused task
td current --json 
  | from json 
  | get focused.issue 
  | select id title status priority 
  | to json
```

**Output:**
```json
{
  "id": "task-123",
  "title": "Implement feature X",
  "status": "in_progress",
  "priority": "high"
}
```

### Example 2: Filter Tasks by Multiple Criteria

```nu
# Find high-priority open tasks
td list --json 
  | from json 
  | where status == "open" and priority == "high" 
  | select id title priority 
  | sort-by priority 
  | table
```

**Output:**
```
╭─────┬──────────────────────┬──────────╮
│ id  │        title         │ priority │
├─────┼──────────────────────┼──────────┤
│ 123 │ Implement feature X  │ high     │
│ 456 │ Fix critical bug     │ high     │
╰─────┴──────────────────────┴──────────╯
```

### Example 3: Generate Task Report

```nu
# Generate a report of all active tasks
td list --json 
  | from json 
  | where status in ["open", "in_progress"] 
  | group-by status 
  | each { |group| {
      status: $group.key,
      count: ($group.value | length),
      tasks: ($group.value | select id title priority)
    }
  } 
  | to json
```

**Output:**
```json
[
  {
    "status": "open",
    "count": 3,
    "tasks": [
      {"id": "123", "title": "Task 1", "priority": "high"},
      {"id": "456", "title": "Task 2", "priority": "medium"},
      {"id": "789", "title": "Task 3", "priority": "low"}
    ]
  },
  {
    "status": "in_progress",
    "count": 1,
    "tasks": [
      {"id": "321", "title": "Task 4", "priority": "high"}
    ]
  }
]
```

### Example 4: Monitor Task Changes

```nu
# Watch for changes in task status
loop {
  clear
  print "Task Status Monitor"
  print "="
  td list --json 
    | from json 
    | where status in ["in_progress", "in_review"] 
    | select id title status updated_at 
    | sort-by updated_at 
    | table
  sleep 30sec
}
```

**Output:**
```
Task Status Monitor
==================
╭─────┬──────────────────────┬─────────────┬─────────────────────╮
│ id  │        title         │   status    │     updated_at      │
├─────┼──────────────────────┼─────────────┼─────────────────────┤
│ 123 │ Implement feature X  │ in_progress │ 2026-03-21T10:00:00Z│
│ 456 │ Review PR #789       │ in_review   │ 2026-03-21T09:30:00Z│
╰─────┴──────────────────────┴─────────────┴─────────────────────╯
```

## References

- [Nushell Documentation](https://www.nushell.sh/) – Official Nushell documentation
- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [Nushell User Playbook](./nushell-user-playbook.md) – General Nushell usage guide
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team

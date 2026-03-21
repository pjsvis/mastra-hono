---
id: PB-023
title: "TD Skill Playbook"
role: "Build"
infrastructure: [td]
last_updated: "2026-03-21"
tags: [playbook]
---

# TD Skill Playbook

## Table of Contents

- [Purpose](#purpose)
- [Overview](#overview)
- [Quick Start](#quick-start)
  - [Session Start (Every Time)](#session-start-every-time)
  - [Single-Issue Workflow](#single-issue-workflow)
  - [Multi-Issue Workflow (Recommended for Agents)](#multi-issue-workflow-recommended-for-agents)
- [Key Workflows](#key-workflows)
  - [Workflow 1: Starting New Work](#workflow-1-starting-new-work)
  - [Workflow 2: Handing Off Work](#workflow-2-handing-off-work)
  - [Workflow 3: Reviewing Code](#workflow-3-reviewing-code)
  - [Workflow 4: Handling Blockers](#workflow-4-handling-blockers)
- [Commands by Category](#commands-by-category)
  - [Checking Status](#checking-status)
  - [Working on Issues](#working-on-issues)
  - [Handing Off](#handing-off)
  - [Reviews](#reviews)
  - [Creating/Managing Issues](#creatingmanaging-issues)
  - [File Tracking](#file-tracking)
  - [Other](#other)
- [Resources](#resources)
  - [[quick_reference.md](references/quick_reference.md)](#[quick_referencemd]referencesquick_referencemd)
  - [[ai_agent_workflows.md](references/ai_agent_workflows.md)](#[ai_agent_workflowsmd]referencesai_agent_workflowsmd)
- [Issue Lifecycle](#issue-lifecycle)
- [Key Principles](#key-principles)
- [For AI Agents](#for-ai-agents)
- [Best Practices](#best-practices)
  - [1. Always Start with Session Check](#1-always-start-with-session-check)
  - [2. Use Structured Handoffs](#2-use-structured-handoffs)
  - [3. Log Decisions Explicitly](#3-log-decisions-explicitly)
  - [4. Track Blockers](#4-track-blockers)
  - [5. Link Files to Issues](#5-link-files-to-issues)
  - [6. Never Approve Your Own Work](#6-never-approve-your-own-work)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Not Starting with Session Check](#pitfall-1-not-starting-with-session-check)
  - [Pitfall 2: Skipping Handoffs](#pitfall-2-skipping-handoffs)
  - [Pitfall 3: Approving Own Work](#pitfall-3-approving-own-work)
  - [Pitfall 4: Not Logging Decisions](#pitfall-4-not-logging-decisions)
  - [Pitfall 5: Not Tracking Blockers](#pitfall-5-not-tracking-blockers)
- [References](#references)

## Purpose
`td` is a minimalist CLI for tracking tasks and maintaining agent memory across context windows. When your AI session ends, `td` captures what was done, what remains, and what decisions were made—so the next session picks up exactly where the last one left off. This playbook provides comprehensive guidelines for using `td` in AI-assisted development workflows.

**Core Philosophy:** Run `td usage` and get everything needed for the next action—current focus, pending reviews, open issues, recent decisions. Maintain structured handoffs to ensure continuity across sessions.


## Overview

`td` is a minimalist CLI for tracking tasks and maintaining agent memory across context windows. When your AI session ends, `td` captures what was done, what remains, and what decisions were made—so the next session picks up exactly where the last one left off.

**Core capability:** Run `td usage` and get everything needed for the next action—current focus, pending reviews, open issues, recent decisions.

## Quick Start

### Session Start (Every Time)

```bash
td usage --new-session  # Auto-rotation + see current state
```

Output tells you:
- Active work sessions and recent decisions
- What issues are pending review (you can review these)
- Highest priority open issues
- Recent handoffs from previous sessions

### Single-Issue Workflow

For focused work on one issue:

```bash
td start <issue-id>                    # Begin work
td log "OAuth callback implemented"    # Track progress
td log --decision "Using JWT tokens"   # Log decisions
td handoff <id> --done "..." --remaining "..."  # Capture state
td review <id>                         # Submit for review
```

### Multi-Issue Workflow (Recommended for Agents)

For agents handling related issues:

```bash
td ws start "Auth implementation"      # Start work session
td ws tag td-a1b2 td-c3d4             # Associate issues (auto-starts them)
td ws tag --no-start td-e5f6          # Associate without starting
td ws log "Shared token storage"       # Log to all tagged issues
td ws handoff                          # Capture state, end session
```

## Key Workflows

### Workflow 1: Starting New Work

```bash
# 1. Check what to work on
td usage          # See current state
td next           # Highest priority open issue
td critical-path  # What unblocks most work

# 2. Start work
td start <id>

# 3. Begin logging
td log "Started implementation"
```

**What this does:**
- Shows current state and available work
- Identifies highest priority issues
- Marks the task as in progress
- Begins tracking progress

### Workflow 2: Handing Off Work

This is **critical** for agent-to-agent handoffs:

```bash
td handoff <id> \
  --done "OAuth flow, token storage" \
  --remaining "Refresh token rotation, error handling" \
  --decision "Using JWT for stateless auth" \
  --uncertain "Should tokens expire on password change?"
```

Keys:
- `--done` - What's actually complete (be honest)
- `--remaining` - What's left (be specific)
- `--decision` - Why you chose approach X
- `--uncertain` - What you're unsure about

Next session will see all this context with `td usage` or `td context <id>`.

**Why this matters:**
- Preserves context across sessions
- Prevents hallucinated progress
- Enables seamless handoffs
- Provides clear decision history

### Workflow 3: Reviewing Code

```bash
# 1. See reviewable issues
td reviewable

# 2. Check details
td show <id>
td context <id>

# 3. Approve or reject
td approve <id>
# Or:
td reject <id> --reason "Missing error handling"
```

**Important:** You cannot approve work you implemented. Session isolation enforces this.

**Why:** Separate review catches issues the implementer missed and ensures quality.

### Workflow 4: Handling Blockers

```bash
# 1. Log the blocker
td log --blocker "Waiting on API spec from backend team"

# 2. Work on something else
td next              # Get another issue
td ws tag td-e5f6   # Add to work session

# 3. Come back to blocked issue later
td context td-a1b2  # Refresh context when blocker resolves
```

**Why:** Enables parallel work and prevents blocking on external dependencies.

## Commands by Category

### Checking Status

- `td usage` - Current state, reviews, next steps
- `td usage -q` - Compact view (after first read)
- `td current` - What you're working on
- `td ws current` - Current work session state
- `td next` - Highest priority open
- `td critical-path` - What unblocks most work

### Working on Issues

- `td start <id>` - Begin work
- `td unstart <id>` - Revert to open (undo accidental start)
- `td log "msg"` - Track progress
- `td log --decision "..."` - Log decision
- `td log --blocker "..."` - Log blocker
- `td show <id>` - View details
- `td context <id>` - Full context for resuming

### Handing Off

- `td handoff <id> --done "..." --remaining "..."` - Single issue
- `td ws handoff` - Multi-issue work session

### Reviews

- `td review <id>` - Submit for review
- `td reviewable` - Issues you can review
- `td approve <id>` - Approve (different session only)
- `td reject <id> --reason "..."` - Reject

### Creating/Managing Issues

- `td create "title" --type feature --priority P1` - Create
- `td list` - List all
- `td list --status in_progress` - Filter by status
- `td block <id>` - Mark as blocked
- `td delete <id>` - Delete

### File Tracking

- `td link <id> <files...>` - Track files with issue
- `td files <id>` - Show file changes

### Other

- `td monitor` - Live dashboard
- `td session --new "name"` - Force new session
- `td undo` - Undo last action

See [quick_reference.md](references/quick_reference.md) for full command listing.

## Resources

### [quick_reference.md](references/quick_reference.md)

Complete command reference organized by task type.

### [ai_agent_workflows.md](references/ai_agent_workflows.md)

Detailed workflows for common AI agent scenarios:
- Single-issue focus
- Multi-issue work sessions
- Handling blockers
- Resuming work
- Code review process
- Tips for AI agents

## Issue Lifecycle

```
open → in_progress → in_review → closed
         |              |
         v              | (reject)
     blocked -----------+
```

**States:**
- **open:** Task is ready to be started
- **in_progress:** Task is being worked on
- **in_review:** Task is under review
- **blocked:** Task is blocked by external dependencies
- **closed:** Task is completed

## Key Principles

**Session Isolation:** Every terminal/context gets a unique session ID. The session that implements code cannot approve it. Different session must review. This forces actual handoffs and prevents "works on my context" bugs.

**Structured Handoffs:** Don't just say "here's what I did"—structure it with done/remaining/decisions/uncertain so next agent has clear context.

**Minimal:** Does one thing. Single binary, SQLite local storage (`.todos/`), no server, works with any AI tool.

## For AI Agents

Always start conversation with:
```bash
td usage --new-session
```

This auto-rotates sessions and gives you current state. Then:

1. **Single focused issue** → Use single-issue workflow
2. **Multiple related issues** → Use `td ws start` for work sessions
3. **Before context ends** → Always `td handoff` or `td ws handoff`
4. **Log decisions** → Use `--decision` flag to explain reasoning
5. **Log uncertainty** → Use `--uncertain` flag to mark unknowns
6. **Track files** → Use `td link` so future sessions know what changed

See [ai_agent_workflows.md](references/ai_agent_workflows.md) for detailed examples.

## Best Practices

### 1. Always Start with Session Check

Run `td usage --new-session` before any work.

```bash
td usage --new-session
```

**Why:** Ensures your session ID is set and you have the current "Work Territory" map.

### 2. Use Structured Handoffs

Always include done, remaining, decisions, and uncertain fields.

```bash
td handoff <id> \
  --done "Completed X" \
  --remaining "Need to do Y" \
  --decision "Chose approach Z" \
  --uncertain "Should we handle edge case?"
```

**Why:** Provides clear context for the next session.

### 3. Log Decisions Explicitly

Use `--decision` flag to explain reasoning.

```bash
td log --decision "Chose approach A because of performance"
```

**Why:** Prevents re-litigating settled decisions.

### 4. Track Blockers

Use `--blocker` flag when blocked.

```bash
td log --blocker "Waiting on API keys"
```

**Why:** Enables parallel work and prevents blocking.

### 5. Link Files to Issues

Use `td link` to track file changes.

```bash
td link <id> src/auth.ts src/user.ts
```

**Why:** Future sessions know what files were changed.

### 6. Never Approve Your Own Work

The session that implements code cannot approve it.

```bash
# Bad
td start <id>
# ... implement ...
td approve <id>

# Good
td start <id>
# ... implement ...
td handoff <id> --done "Implemented X"
# ... new session ...
td approve <id>
```

**Why:** Separate review catches issues the implementer missed.

## Common Pitfalls

### Pitfall 1: Not Starting with Session Check

**Problem:** Starting work without checking current state.

**Solution:** Always run `td usage --new-session` first.

```bash
# Bad
# Just start working

# Good
td usage --new-session
# Then start working
```

### Pitfall 2: Skipping Handoffs

**Problem:** Ending sessions without recording handoffs.

**Solution:** Always perform a handoff before ending the session.

```bash
# Bad
# Just end the session

# Good
td handoff <id> --done "Completed X" --remaining "Need to do Y"
```

### Pitfall 3: Approving Own Work

**Problem:** Approving code in the same session that implemented it.

**Solution:** Always perform a handoff and approve in a new session.

```bash
# Bad
td start <id>
# ... implement ...
td approve <id>

# Good
td start <id>
# ... implement ...
td handoff <id> --done "Implemented X"
# ... new session ...
td approve <id>
```

### Pitfall 4: Not Logging Decisions

**Problem:** Not recording key decisions.

**Solution:** Use `--decision` flag to document reasoning.

```bash
# Bad
td log "Implemented feature"

# Good
td log --decision "Chose approach A because of performance"
```

### Pitfall 5: Not Tracking Blockers

**Problem:** Not logging when blocked.

**Solution:** Use `--blocker` flag to document blockers.

```bash
# Bad
# Just wait when blocked

# Good
td log --blocker "Waiting on API keys"
```

## References

- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [TD Agent Playbook](./td-agent-playbook.md) – Agent-specific TD usage
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team

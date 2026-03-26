---
id: PB-022
title: "TD Agent Playbook"
role: "Build"
infrastructure: [td]
last_updated: "2026-03-21"
tags: [playbook]
---

# TD Agent Playbook

## Table of Contents

- [Purpose](#purpose)
- [Core Principles](#core-principles)
- [Mandatory Directives](#mandatory-directives)
  - [Mandatory Session Check](#mandatory-session-check)
  - [Mandatory Task Creation](#mandatory-task-creation)
  - [Start and Focus](#start-and-focus)
  - [Track Progress and Decisions](#track-progress-and-decisions)
  - [Mandatory Handoff (Crucial)](#mandatory-handoff-crucial)
  - [Review Workflow Separation](#review-workflow-separation)
- [Standard Workflow](#standard-workflow)
  - [Plan](#plan)
  - [Implement](#implement)
  - [Handoff](#handoff)
  - [Review](#review)
  - [Review Agent Checklist (GH API)](#review-agent-checklist-gh-api)
- [Querying State](#querying-state)
- [Parallel Sessions: Build + Review](#parallel-sessions-build-+-review)
  - [Session A — Build Agent](#session-a-—-build-agent)
  - [Session B — Review Agent (Separate Session)](#session-b-—-review-agent-separate-session)
  - [Practical Setup](#practical-setup)
- [Do / Don't](#do--don't)
  - [Do](#do)
  - [Don't](#don't)
- [Session End Checklist](#session-end-checklist)
- [Summary Checklist](#summary-checklist)
- [Best Practices](#best-practices)
  - [1. Always Start with Session Check](#1-always-start-with-session-check)
  - [2. Create Tasks Before Starting Work](#2-create-tasks-before-starting-work)
  - [3. Log Decisions Explicitly](#3-log-decisions-explicitly)
  - [4. Always Perform Handoffs](#4-always-perform-handoffs)
  - [5. Never Approve Your Own Work](#5-never-approve-your-own-work)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Starting Work Without a Task](#pitfall-1-starting-work-without-a-task)
  - [Pitfall 2: Forgetting Handoffs](#pitfall-2-forgetting-handoffs)
  - [Pitfall 3: Approving Own Code](#pitfall-3-approving-own-code)
  - [Pitfall 4: Not Logging Decisions](#pitfall-4-not-logging-decisions)
- [References](#references)

## Purpose
This playbook defines how AI agents must use the `td` CLI as structured external memory to ensure continuity across sessions, clear accountability, and reliable review workflows. For Nushell-based structured querying, see `playbooks/nushell-agent-playbook.md`.

**Core Philosophy:** Tasks before work. Never start implementation without a task. Record key decisions and blockers in `td` logs. Every session must end with a `td handoff`. The implementation session cannot approve its own work.


## Core Principles

1. **Tasks before work**: Never start implementation without a task.
2. **Traceable decisions**: Record key decisions and blockers in `td` logs.
3. **Reliable handoffs**: Every session must end with a `td handoff`.
4. **Review separation**: The implementation session cannot approve its own work.

## Mandatory Directives

### Mandatory Session Check

Always begin by reviewing open work and epics:

```bash
td usage --new-session
```

**Why:** This initializes your session ID and provides the current "Work Territory" map. It's your mandatory ground signal.

### Mandatory Task Creation

If no task exists, create one before doing anything else.

```bash
# Create an issue
td create "Implement feature X" --type feature --priority P1

# Create an epic
td epic create "Feature X System" --priority P0

# Link a child issue to an epic
td create "Child task" --parent td-abc123
```

**Why:** Tasks provide structured external memory that persists context across sessions.

### Start and Focus

Ensure the active task is started and focused:

```bash
td start <issue-id>
td focus <issue-id>
```

**Why:** Marks the task as in progress and links it to your current session.

### Track Progress and Decisions

Log progress and decisions as you go:

```bash
td log "Implemented core logic"
td log --decision "Chose approach A because of performance"
td log --blocker "Waiting on API keys"
```

**Why:** Provides breadcrumbs for reviewers and future agents.

### Mandatory Handoff (Crucial)

Before your context window ends, always run a handoff.

```bash
td handoff td-abc123 \
  --done "Completed item 1, Completed item 2" \
  --remaining "Item 3, Item 4" \
  --decision "Used standard library to minimize dependencies" \
  --uncertain "Should we handle edge case Z?"
```

**Why:** Preserves context for the next agent or developer and ensures continuity.

**Required fields:**
- `--done`: What has been completed
- `--remaining`: What still needs to be done
- `--decision`: Key decisions made during the session

**Optional fields:**
- `--uncertain`: Areas of uncertainty
- `--blocked`: What's blocking progress

### Review Workflow Separation

The implementation session must not approve its own work. A separate review agent inspects the PR, resolves issues, and only then approves the task in `td`.

```bash
# Submit your work for review
td review <issue-id>

# In a different session (review agent):
td reviewable
td context <issue-id>
td files <issue-id>
# Inspect PR checks + review comments, fix issues, push updates
# When PR is clean and ready to merge:
td approve <issue-id>
td reject <issue-id> --reason "Missing tests"
```

**Why:** Separate review catches issues the implementer missed and ensures quality.

## Standard Workflow

### Plan

```bash
td usage --new-session
td list
td create "Fix authentication bug" --type bug --priority P1
td start <issue-id>
```

**What this does:**
- Initializes your session
- Lists existing tasks
- Creates a new task if needed
- Marks the task as in progress

### Implement

```bash
td focus <issue-id>
td log --decision "Selecting approach B for simpler rollback"
td log "Added input validation and updated tests"
```

**What this does:**
- Focuses your session on the task
- Records key decisions
- Tracks progress

### Handoff

```bash
td handoff <issue-id> \
  --done "Implemented X and Y" \
  --remaining "Need to validate Z in staging" \
  --decision "Kept API surface unchanged"
```

**What this does:**
- Records what was completed
- Documents remaining work
- Captures key decisions
- Preserves context for next session

### Review

```bash
td review <issue-id>
# Reviewer (separate session):
td reviewable
td context <issue-id>
# Inspect PR checks + review comments, fix issues, push updates
td approve <issue-id>
```

**What this does:**
- Submits work for review
- Reviewer inspects the PR
- Reviewer approves when ready

### Review Agent Checklist (GH API)

When reviewing a PR, use the GitHub API to gather all relevant information:

- **Pull review comments (line-level):**
  ```bash
  gh api repos/<owner>/<repo>/pulls/<pr_number>/comments
  ```

- **Pull review summaries:**
  ```bash
  gh api repos/<owner>/<repo>/pulls/<pr_number>/reviews
  ```

- **Pull general PR comments:**
  ```bash
  gh api repos/<owner>/<repo>/issues/<pr_number>/comments
  ```

- **Filter unresolved CodeRabbit items:**
  ```bash
  gh api repos/<owner>/<repo>/pulls/<pr_number>/comments --jq 'map(select(.body | contains("Addressed") | not))'
  ```

- **Once all actionable items are resolved and checks are green:**
  ```bash
  td reviewable
  td approve <issue-id>
  ```

**Why:** Comprehensive review ensures quality before approval.

## Querying State

```bash
td list                          # List open issues
td query "status = in_progress"  # Advanced query
td critical-path                 # See optimal work sequence
td dep add <issue> <depends>     # Add a dependency
```

**When to use:**
- Checking task status
- Finding work to do
- Understanding dependencies
- Planning work sequence

## Parallel Sessions: Build + Review

Use this when you want one agent to implement while another reviews in parallel. The key is **separate sessions** and **separate `td usage --new-session` calls**.

### Session A — Build Agent

```bash
td usage --new-session
td create "Implement feature X" --type feature --priority P1
td start td-abc123
td focus td-abc123
td log --decision "Chose approach A for simpler rollback"
# ... implementation happens ...
td handoff td-abc123 \
  --done "Implemented core logic and tests" \
  --remaining "Validate edge cases in staging"
td review td-abc123
```

### Session B — Review Agent (Separate Session)

```bash
td usage --new-session
td reviewable
td context td-abc123
td files td-abc123
td approve td-abc123
```

### Practical Setup

- Two chat windows (or two terminals), one per agent
- Each session runs `td usage --new-session` once at start
- Only the reviewer approves

**Why:** Parallel development and review increases velocity while maintaining quality.

## Do / Don't

### Do

✅ Start with `td usage --new-session`
✅ Create a task if none exists
✅ Log decisions and blockers
✅ Run a handoff before ending the session
✅ Submit for review and let a separate session approve

### Don't

❌ Start work without a task
❌ Skip `td handoff`
❌ Approve your own work in the same session
❌ Leave progress undocumented

## Session End Checklist

- [ ] Run `td handoff <issue-id> --done ... --remaining ... --decision ... --uncertain ...`
- [ ] Submit for review with `td review <issue-id>` (if implementation is complete)
- [ ] Never approve your own work in the same session

## Summary Checklist

- [ ] `td usage --new-session`
- [ ] Task exists (create if missing)
- [ ] `td start` and `td focus`
- [ ] Log decisions and blockers
- [ ] `td handoff` at session end
- [ ] `td review` and separate approval

## Best Practices

### 1. Always Start with Session Check

Run `td usage --new-session` before any work.

```bash
td usage --new-session
```

**Why:** Ensures your session ID is set and you have the current "Work Territory" map.

### 2. Create Tasks Before Starting Work

Never start work without a task.

```bash
td create "Task title" --type feature --priority P1
```

**Why:** Tasks provide structured external memory that persists context.

### 3. Log Decisions Explicitly

Use `td log --decision` to document key decisions.

```bash
td log --decision "Chose approach A because of performance"
```

**Why:** Provides context for reviewers and prevents re-litigating settled decisions.

### 4. Always Perform Handoffs

Run `td handoff` before ending the session.

```bash
td handoff <issue-id> \
  --done "Completed X" \
  --remaining "Need to do Y" \
  --decision "Chose approach Z"
```

**Why:** Preserves context for the next agent or developer.

### 5. Never Approve Your Own Work

The session that implements code cannot approve it.

```bash
# Bad
td start <task-id>
# ... implement ...
td approve <task-id>

# Good
td start <task-id>
# ... implement ...
td handoff <task-id> --done "Implemented X"
# ... new session ...
td approve <task-id>
```

**Why:** Separate review catches issues the implementer missed.

## Common Pitfalls

### Pitfall 1: Starting Work Without a Task

**Problem:** Beginning work without creating or linking a task.

**Solution:** Always create or link a task before starting work.

```bash
# Bad
# Just start coding without a task

# Good
td create "Implement feature X" --type feature
td start <task-id>
# Then start coding
```

### Pitfall 2: Forgetting Handoffs

**Problem:** Ending sessions without recording handoffs.

**Solution:** Always perform a handoff before ending the session.

```bash
# Bad
# Just end the session

# Good
td handoff <task-id> \
  --done "Completed X" \
  --remaining "Need to do Y" \
  --decision "Chose approach Z"
```

### Pitfall 3: Approving Own Code

**Problem:** Approving code in the same session that implemented it.

**Solution:** Always perform a handoff and approve in a new session.

```bash
# Bad
td start <task-id>
# ... implement ...
td approve <task-id>

# Good
td start <task-id>
# ... implement ...
td handoff <task-id> --done "Implemented X"
# ... new session ...
td approve <task-id>
```

### Pitfall 4: Not Logging Decisions

**Problem:** Not recording key decisions and blockers.

**Solution:** Use `td log` to document progress and decisions.

```bash
# Bad
# Just implement without logging

# Good
td log --decision "Chose approach A because of performance"
td log --blocker "Waiting on API keys"
```

## References

- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Sidecar Agent Playbook](./sidecar-agent-playbook.md) – Sidecar integration for agents
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy
- [Nushell Agent Playbook](./nushell-agent-playbook.md) – Nushell integration for task state

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team

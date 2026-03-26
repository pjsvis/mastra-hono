---
id: PB-011
title: "Git & TD Workflow Playbook"
role: "Orchestrate"
infrastructure: [td, git]
last_updated: "2026-03-21"
tags: [playbook]
---

# Git & TD Workflow Playbook

## Table of Contents

- [Purpose](#purpose)
- [Branching & Workspaces](#branching-&-workspaces)
  - [Core Rules](#core-rules)
  - [Why This Matters](#why-this-matters)
- [The TD Flow](#the-td-flow)
  - [Picking Up Work](#picking-up-work)
  - [During Development](#during-development)
  - [Context Handoffs](#context-handoffs)
- [Reviews & Merging](#reviews-&-merging)
  - [The Review Process](#the-review-process)
  - [Why This Separation Matters](#why-this-separation-matters)
- [Resolving Conflicts](#resolving-conflicts)
  - [What NOT to Do](#what-not-to-do)
  - [What TO Do](#what-to-do)
  - [Common Issues and Solutions](#common-issues-and-solutions)
- [Best Practices](#best-practices)
  - [1. Always Link Workspaces to Tasks](#1-always-link-workspaces-to-tasks)
  - [2. Perform Handoffs Before Context Window Ends](#2-perform-handoffs-before-context-window-ends)
  - [3. Keep Worktrees Until Approval](#3-keep-worktrees-until-approval)
  - [4. Never Skip Quality Checks](#4-never-skip-quality-checks)
  - [5. Log Decisions Explicitly](#5-log-decisions-explicitly)
  - [6. Test Before Submitting for Review](#6-test-before-submitting-for-review)
- [References](#references)

## Purpose
This playbook defines our expected workflow for branching, using Sidecar workspaces, and managing task reviews using the `td` CLI. It provides a systematic approach to parallel development, context management, and code review processes.

**Core Philosophy:** Maintain clean separation between implementation, automated review, and approval while preserving context across sessions and agents.


## Branching & Workspaces

We use Sidecar Workspaces to manage parallel development and git worktrees.

### Core Rules

1. **Never work directly on `main`.**
2. **Open Sidecar:** Use `sidecar` in the terminal.
3. **Create a Workspace:** Press `n` in the Workspaces plugin to create an isolated branch/worktree.
4. **Link to a Task:** Press `t` to link your active `td` issue to the workspace. This ensures the context is persisted specifically for this branch.

### Why This Matters

- **Isolation:** Each workspace has its own git worktree, preventing conflicts between parallel development efforts.
- **Context Preservation:** Linking to a task ensures that all work is associated with the correct issue and context.
- **Clean History:** By never working on `main`, we maintain a clean, merge-free main branch.

## The TD Flow

The `td` CLI provides task management and context tracking throughout the development lifecycle.

### Picking Up Work

Start every new feature or bug fix by identifying its `td` issue.

```bash
td usage --new-session
td start <issue-id>
td focus <issue-id>
```

**What this does:**
- `td usage --new-session` initializes your session ID and provides the current "Work Territory" map
- `td start` marks the task as in progress
- `td focus` links the task to your current session

### During Development

Log your decisions and blockers. This acts as breadcrumbs for reviewers or other agents that might resume this session.

```bash
td log --decision "Chose approach X because Y"
```

**What to log:**
- **Decisions:** Why you chose a particular approach
- **Blockers:** What's preventing progress
- **Assumptions:** What you're assuming to be true
- **Questions:** What you need clarification on

### Context Handoffs

When you are done for the day or the agent's context window is ending, you **must** perform a handoff. This prevents the next agent/developer from hallucinating state.

```bash
td handoff <issue-id> \
  --done "Implemented A and B" \
  --remaining "Need to test C" \
  --decision "Used a fast path for D"
```

**Required fields:**
- `--done`: What has been completed
- `--remaining`: What still needs to be done
- `--decision`: Key decisions made during the session

**Optional fields:**
- `--uncertain`: Areas of uncertainty
- `--blocked`: What's blocking progress

## Reviews & Merging

We enforce a strict separation between implementation, automated review, and approval.

### The Review Process

1. **Submit for Review:** Once your work in the workspace is complete, and your tests pass, run:
   ```bash
   td review <issue-id>
   ```

2. **Create PR:** Use Sidecar's merge workflow by pressing `m` in the Workspaces plugin to commit, push, create a PR, and optionally clean up the worktree.

3. **Worktree Retention Policy:**
   - Keep the worktree **until the PR is approved** to avoid reinstalling dependencies during review updates
   - Delete the worktree **immediately after merge/approval**

4. **Review Agent Gate:** A separate agent session inspects the PR for:
   - Failing checks (lint, types, tests)
   - Unresolved review comments
   - Code quality issues
   The agent fixes issues and pushes updates until the PR is clean.

5. **Approval (TD):** After the PR is clear for merge, the review agent updates the task state by running:
   ```bash
   td reviewable
   td approve <issue-id>
   ```

6. **Human Merge + Tidy:** The human in the loop merges the PR and performs final TD cleanup.

### Why This Separation Matters

- **Quality:** Automated review catches issues before human review
- **Efficiency:** Separate agents can work on implementation and review in parallel
- **Accountability:** Clear handoff points prevent ambiguity about who is responsible

## Resolving Conflicts

If you encounter biome or type issues preventing a commit:

### What NOT to Do

❌ **Do not use `--no-verify`.** This bypasses quality checks and introduces technical debt.

### What TO Do

✅ **Fix the issues properly.** If you are experimenting, move the experimental code to `scripts/lab/` where type-safety is disabled.

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Biome formatting errors | Run `bun run format` to auto-fix |
| Type errors | Fix types or add proper type annotations |
| Lint errors | Address linting issues or add suppressions with justification |
| Test failures | Fix tests or update them to match new behavior |

## Best Practices

### 1. Always Link Workspaces to Tasks

Never create a workspace without linking it to a `td` issue. This ensures context is preserved and work is traceable.

### 2. Perform Handoffs Before Context Window Ends

If you're an agent, perform a handoff before your context window fills up. This prevents the next agent from losing important context.

### 3. Keep Worktrees Until Approval

Don't delete worktrees immediately after creating a PR. Keep them until the PR is approved to avoid reinstalling dependencies during review iterations.

### 4. Never Skip Quality Checks

Never use `--no-verify` to bypass checks. If you need to bypass checks, move the code to `scripts/lab/` where type-safety is disabled.

### 5. Log Decisions Explicitly

Use `td log --decision` to document key decisions. This helps reviewers understand your reasoning and prevents re-litigating settled decisions.

### 6. Test Before Submitting for Review

Run all verification checks (lint + types + tests) before running `td review`. This reduces review iteration time.

## References

- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [Sidecar Documentation](../docs/sidecar.md) – Workspace and worktree management
- [Biome Standards Playbook](./biome-standards.md) – Code formatting and linting standards
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team

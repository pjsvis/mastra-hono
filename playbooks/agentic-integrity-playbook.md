---
id: PB-001
title: "Agentic Integrity Playbook"
role: "Review | Orchestrate"
infrastructure: [td, gh-aw, ntfy]
last_updated: "2026-03-21"
tags: [playbook]
---

# Agentic Integrity Playbook

## Table of Contents

- [Purpose](#purpose)
- [Prerequisites](#prerequisites)
  - [Required Tools](#required-tools)
  - [Infrastructure Requirements](#infrastructure-requirements)
  - [Verification](#verification)
- [Infrastructure Setup](#infrastructure-setup)
  - [Local "Gumption" Layer](#local-"gumption"-layer)
  - [Cloud "Sovereignty" Layer](#cloud-"sovereignty"-layer)
- [Artefact Generation](#artefact-generation)
  - [A. `AGENTS.md` (The Constitution)](#a-`agentsmd`-the-constitution)
- [Tech Stack](#tech-stack)
- [Mandatory Library Patterns](#mandatory-library-patterns)
- [Coding Standards](#coding-standards)
- [Forbidden Actions](#forbidden-actions)
- [Purpose](#purpose)
- [Tech Stack](#tech-stack)
- [Mandatory Library Patterns](#mandatory-library-patterns)
- [Coding Standards](#coding-standards)
- [Forbidden Actions](#forbidden-actions)
  - [B. `review.md` (The Cloud Reviewer)](#b-`reviewmd`-the-cloud-reviewer)
- [Review Instructions](#review-instructions)
  - [Validation Steps](#validation-steps)
- [Notification Logic](#notification-logic)
- [Purpose](#purpose)
- [Review Instructions](#review-instructions)
  - [Validation Steps](#validation-steps)
  - [Success Criteria](#success-criteria)
- [Notification Logic](#notification-logic)
- [Failure Handling](#failure-handling)
  - [C. `conceptual-lexicon.json`](#c-`conceptual-lexiconjson`)
- [The Canonical Workflow Loop](#the-canonical-workflow-loop)
  - [Phase A — Delivery Agent (Build + PR)](#phase-a-—-delivery-agent-build-+-pr)
  - [Phase B — Review Agent (PR Health Gate)](#phase-b-—-review-agent-pr-health-gate)
  - [Phase C — Human Merge + Tidy](#phase-c-—-human-merge-+-tidy)
- [Deployment Heuristics](#deployment-heuristics)
  - [Start with Mastra-Hono](#start-with-mastra-hono)
  - [Fail Fast](#fail-fast)
  - [Human in the Loop](#human-in-the-loop)
- [Best Practices](#best-practices)
  - [1. Always Start with `td usage --new-session`](#1-always-start-with-`td-usage---new-session`)
  - [2. Use `bun run ask` for Clarification](#2-use-`bun-run-ask`-for-clarification)
  - [3. Run `bun run check` Before Committing](#3-run-`bun-run-check`-before-committing)
  - [4. Perform Handoffs Before Context Window Ends](#4-perform-handoffs-before-context-window-ends)
  - [5. Keep Worktrees Until Approval](#5-keep-worktrees-until-approval)
  - [6. Use Descriptive Commit Messages](#6-use-descriptive-commit-messages)
  - [7. Test Edge Cases](#7-test-edge-cases)
  - [8. Document Decisions](#8-document-decisions)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Skipping Pre-Commit Checks](#pitfall-1-skipping-pre-commit-checks)
  - [Pitfall 2: Not Performing Handoffs](#pitfall-2-not-performing-handoffs)
  - [Pitfall 3: Ignoring Review Feedback](#pitfall-3-ignoring-review-feedback)
  - [Pitfall 4: Deleting Worktrees Too Early](#pitfall-4-deleting-worktrees-too-early)
  - [Pitfall 5: Spamming Notifications](#pitfall-5-spamming-notifications)
- [References](#references)

## Purpose
This playbook outlines how to replicate the "Agentic Integrity" workflow in any new or existing project. It is based on the **Symmetric Mentation** principle: splitting high-velocity execution from sovereign auditing. This ensures that agents can work quickly while maintaining quality through automated review processes.

**Core Philosophy:** Separate delivery (local execution) from review (cloud auditing) to maintain both velocity and integrity in agentic development workflows.


## Prerequisites

Before implementing the Agentic Integrity workflow, ensure you have the following tools and infrastructure in place.

### Required Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| `gh` CLI | GitHub command-line interface | `brew install gh` |
| `gh-aw` extension | GitHub Actions workflow automation | `gh extension install github/gh-actions-workflow` |
| `td` CLI | Task management and context tracking | See TD documentation |
| `ntfy` app (optional) | Push notifications to mobile device | Download from ntfy.sh |

### Infrastructure Requirements

- **Git Worktrees Support**: Your Git installation must support worktrees for isolated development environments
- **GitHub Actions**: Repository must have GitHub Actions enabled
- **Secrets Management**: Ability to store secrets in GitHub repository settings

### Verification

Before proceeding, verify your setup:

```bash
# Check gh CLI
gh --version

# Check gh-aw extension
gh aw --version

# Check td CLI
td --version

# Check git worktree support
git worktree --version
```

## Infrastructure Setup

The Agentic Integrity workflow requires two layers: a local "Gumption" layer for execution and a cloud "Sovereignty" layer for review.

### Local "Gumption" Layer

The local layer provides the execution environment where agents work on tasks.

#### Step 1: Initialize `td`

Initialize the task management system for your project:

```bash
td init --name <project-name>
```

**What this does:**
- Creates a `.td/` directory in your project root
- Sets up the task database
- Configures the project-specific task context

#### Step 2: Haptic Link

Create a notification alias to receive alerts on your mobile device:

```bash
# Add to your shell config (~/.bashrc, ~/.zshrc, or ~/.config/nushell/config.nu)
alias notify='curl -d "$1" ntfy.sh/<private-topic-id>'
```

**How to get your topic ID:**
1. Visit [ntfy.sh](https://ntfy.sh/)
2. Choose a topic name (e.g., `my-project-alerts`)
3. Subscribe to the topic on your mobile device
4. Use the topic name in your notify alias

**Usage:**
```bash
notify "Task completed successfully"
notify "PR needs review: #123"
```

### Cloud "Sovereignty" Layer

The cloud layer provides automated review and quality gates.

#### Step 1: Initialize GHAW

Set up GitHub Actions workflow automation:

```bash
gh aw init
```

**What this does:**
- Creates `.github/workflows/` directory structure
- Sets up workflow templates
- Configures GitHub Actions integration

#### Step 2: Repo Secrets

Add the ntfy URL to your GitHub repository secrets:

```bash
# Using gh CLI
gh secret set NTFY_URL --body "https://ntfy.sh/<private-topic-id>"

# Or via GitHub UI:
# Settings → Secrets and variables → Actions → New repository secret
# Name: NTFY_URL
# Value: https://ntfy.sh/<private-topic-id>
```

**Why this matters:**
- Allows cloud workflows to send notifications
- Keeps credentials secure
- Enables real-time feedback on PR status

## Artefact Generation

Every project implementing Agentic Integrity needs three core anchors that define the workflow and quality standards.

### A. `AGENTS.md` (The Constitution)

Place at `/AGENTS.md` in your project root. This document serves as the "constitution" for all agents working on the project.

#### Required Sections

**Tech Stack and Patterns:**
```markdown
## Tech Stack

- **Framework**: [Your framework]
- **Language**: [Your language]
- **Package Manager**: [Your package manager]

## Mandatory Library Patterns

- All tools must use Zod schemas for validation
- No `any` types allowed in production code
- All functions must have explicit type annotations
```

**Coding Standards:**
```markdown
## Coding Standards

- No `any` types
- Zod for all schemas
- Explicit error handling
- Comprehensive test coverage
```

**Forbidden Actions:**
```markdown
## Forbidden Actions

- Do not touch `.env` files directly
- Do not commit secrets
- Do not bypass pre-commit hooks
- Do not use `--no-verify` for commits
```

#### Example

```markdown
---
date: 2026-03-21
tags: [constitution, agents, standards]
version: 1.0
last_updated: 2026-03-21
---

# AGENTS.md

## Purpose
This document defines the constitution for all agents working on this project.

## Tech Stack
- **Framework**: Hono
- **Language**: TypeScript
- **Package Manager**: Bun

## Mandatory Library Patterns
- All tools must use Zod schemas for validation
- No `any` types allowed in production code
- All functions must have explicit type annotations

## Coding Standards
- No `any` types
- Zod for all schemas
- Explicit error handling
- Comprehensive test coverage

## Forbidden Actions
- Do not touch `.env` files directly
- Do not commit secrets
- Do not bypass pre-commit hooks
- Do not use `--no-verify` for commits
```

### B. `review.md` (The Cloud Reviewer)

Place at `.github/workflows/review.md`. This document provides instructions for the sovereign reviewer agent.

#### Required Sections

**Review Instructions:**
```markdown
## Review Instructions

You are a sovereign reviewer agent. Your job is to ensure code quality before merge.

### Validation Steps

1. Run all tests: `bun test`
2. Check types: `tsc --noEmit`
3. Lint code: `bun run lint`
4. Review changes for security issues
5. Check for proper documentation
```

**Notification Logic:**
```markdown
## Notification Logic

Send notifications via ntfy when:
- PR is ready for review
- PR has issues that need attention
- PR is approved and ready to merge
```

#### Example

```markdown
---
date: 2026-03-21
tags: [review, workflow, automation]
version: 1.0
last_updated: 2026-03-21
---

# Review Workflow

## Purpose
Automated review process for pull requests.

## Review Instructions

You are a sovereign reviewer agent. Your job is to ensure code quality before merge.

### Validation Steps

1. Run all tests: `bun test`
2. Check types: `tsc --noEmit`
3. Lint code: `bun run lint`
4. Review changes for security issues
5. Check for proper documentation

### Success Criteria

- All tests pass
- No type errors
- No lint errors
- Security review passes
- Documentation is complete

## Notification Logic

Send notifications via ntfy when:
- PR is ready for review
- PR has issues that need attention
- PR is approved and ready to merge

## Failure Handling

If any validation fails:
1. Comment on the PR with specific issues
2. Send notification to developer
3. Block merge until issues are resolved
```

### C. `conceptual-lexicon.json`

Sync the latest Lexicon (`v1.79+`) to ensure agent persona alignment across local and cloud environments.

#### Location

Place at `.github/conceptual-lexicon.json` or in your project root.

#### Purpose

The conceptual lexicon ensures that all agents (local and cloud) use consistent terminology and persona definitions.

#### Example

```json
{
  "version": "1.79",
  "personas": {
    "delivery-agent": {
      "name": "Delivery Agent",
      "description": "High-velocity execution agent focused on implementation",
      "capabilities": [
        "code generation",
        "testing",
        "documentation"
      ]
    },
    "review-agent": {
      "name": "Review Agent",
      "description": "Sovereign auditing agent focused on quality",
      "capabilities": [
        "code review",
        "security analysis",
        "quality gates"
      ]
    }
  },
  "terminology": {
    "gumption": "Local execution layer",
    "sovereignty": "Cloud review layer",
    "handoff": "Context transfer between agents"
  }
}
```

## The Canonical Workflow Loop

This is the end-to-end, canonical loop using the tools we already have. It consists of three phases: Delivery, Review, and Human Merge.

### Phase A — Delivery Agent (Build + PR)

The delivery agent works locally to implement features and create pull requests.

#### Step 1: Identify

Run `td usage --new-session` to see the work territory:

```bash
td usage --new-session
```

**What this does:**
- Initializes your session ID
- Provides the current "Work Territory" map
- Shows ready-to-start tasks

#### Step 2: Forge

Run `bun run forge` to pick a Brief and link it to a Task:

```bash
bun run forge
```

**What this does:**
- Lists available briefs
- Creates or links to a task
- Sets up the development context

#### Step 3: Implement

The local agent follows `AGENTS.md` to implement the task.

**If confused, it runs:**
```bash
bun run ask "your question here"
```

This pings the developer's iPhone via ntfy for clarification.

#### Step 4: Local Verify

Run local verification checks:

```bash
bun run check
```

**What this does:**
- Runs linters
- Checks types
- Runs tests
- Validates code quality

#### Step 5: Finish

Run `bun run finish` to complete the task:

```bash
bun run finish
```

**What this does:**
- Auto-checks quality (lint + types + tests)
- Auto-generates a Debrief
- Links artifacts to the task
- Triggers the Cloud Audit
- Creates a GitHub PR

#### Step 6: Handoff

Ensure a `td handoff` is recorded before ending the session:

```bash
td handoff <issue-id> \
  --done "Implemented feature X" \
  --remaining "Need to test edge case Y" \
  --decision "Used approach Z for performance"
```

**Required fields:**
- `--done`: What has been completed
- `--remaining`: What still needs to be done
- `--decision`: Key decisions made

### Phase B — Review Agent (PR Health Gate)

The review agent works in the cloud to ensure PR quality before merge.

#### Step 1: Inspect PRs

Use `gh` to list open PRs and check status + review comments:

```bash
gh pr list
gh pr view <pr-number>
```

**What to check:**
- CI status (passing/failing)
- Review comments
- CodeRabbit feedback
- Security alerts

#### Step 2: Fix & Push

Address actionable issues and push updates:

```bash
# Make fixes locally
git add .
git commit -m "Fix review feedback"

# Push updates
git push
```

**Common issues to address:**
- Failing tests
- Type errors
- Lint violations
- Security vulnerabilities
- Code review comments

#### Step 3: Re-check

Re-run `bun run check` until the PR is clean:

```bash
bun run check
```

**Success criteria:**
- All tests pass
- No type errors
- No lint errors
- All review comments addressed

#### Step 4: TD Approval Gate

Once the PR is clean and review-ready, run:

```bash
td reviewable
td approve <issue-id>
```

**What this does:**
- Marks the task as reviewable
- Approves the task for merge
- Updates task status

### Phase C — Human Merge + Tidy

The human in the loop performs final merge and cleanup.

#### Step 1: Merge

Merge the PR in GitHub:

```bash
# Via gh CLI
gh pr merge <pr-number> --merge

# Or via GitHub UI
# Click "Merge pull request" button
```

#### Step 2: Cleanup

Clean up the task in `td`:

```bash
# Final tidy-up and closeout
td close <issue-id>

# Delete worktree if applicable
git worktree remove <worktree-path>
```

**What to clean up:**
- Close the task
- Delete worktrees
- Remove temporary branches
- Archive related artifacts

## Deployment Heuristics

Guidelines for deploying the Agentic Integrity workflow to new projects.

### Start with Mastra-Hono

This stack is low-entropy and high-visibility, making it the perfect "Pilot" for the workflow.

**Why Mastra-Hono:**
- Well-structured codebase
- Comprehensive documentation
- Strong type safety
- Clear separation of concerns
- Active development

**Pilot approach:**
1. Implement workflow in Mastra-Hono first
2. Test and refine the process
3. Document lessons learned
4. Apply to other projects

### Fail Fast

The cloud agent should fail the PR immediately if `tsc` or `lint` fails.

**Why fail fast:**
- Prevents bad code from entering review
- Saves reviewer time
- Encourages quality at the source
- Reduces feedback loop time

**Implementation:**
```yaml
# In .github/workflows/review.yml
- name: Type Check
  run: tsc --noEmit
  continue-on-error: false  # Fail immediately

- name: Lint
  run: bun run lint
  continue-on-error: false  # Fail immediately
```

### Human in the Loop

Only use `ntfy` for signals requiring immediate attention. Don't spam the "Haptic Link".

**When to notify:**
- PR is ready for review (✅)
- PR has critical issues (❌)
- Build is failing (❌)
- Security vulnerabilities found (❌)

**When NOT to notify:**
- Routine status updates
- Minor lint warnings
- Informational messages
- Success confirmations (unless critical)

**Notification best practices:**
- Keep messages concise
- Include actionable information
- Use clear status indicators
- Avoid notification fatigue

## Best Practices

### 1. Always Start with `td usage --new-session`

Before any work, initialize your session:

```bash
td usage --new-session
```

**Why:** Ensures your session ID is set and you have the current "Work Territory" map.

### 2. Use `bun run ask` for Clarification

When confused, ping the human:

```bash
bun run ask "I'm not sure how to handle this edge case"
```

**Why:** Prevents agents from making incorrect assumptions and ensures alignment.

### 3. Run `bun run check` Before Committing

Always verify code quality before committing:

```bash
bun run check
```

**Why:** Catches issues early and reduces review iteration time.

### 4. Perform Handoffs Before Context Window Ends

If you're an agent, perform a handoff before your context window fills up:

```bash
td handoff <issue-id> \
  --done "Completed X" \
  --remaining "Need to do Y" \
  --decision "Chose approach Z"
```

**Why:** Preserves context for the next agent or developer.

### 5. Keep Worktrees Until Approval

Don't delete worktrees immediately after creating a PR:

```bash
# Keep worktree until PR is approved
git worktree list

# Delete only after merge
git worktree remove <worktree-path>
```

**Why:** Avoids reinstalling dependencies during review iterations.

### 6. Use Descriptive Commit Messages

Write clear, descriptive commit messages:

```bash
git commit -m "feat: implement user authentication

- Add login endpoint
- Implement JWT validation
- Add error handling

Closes #123"
```

**Why:** Makes review easier and provides context for future developers.

### 7. Test Edge Cases

Don't just test the happy path:

```typescript
// Test edge cases
it('should handle empty input', async () => { /* ... */ });
it('should handle null values', async () => { /* ... */ });
it('should handle maximum values', async () => { /* ... */ });
```

**Why:** Ensures robustness and prevents production issues.

### 8. Document Decisions

Use `td log --decision` to document key decisions:

```bash
td log --decision "Used Redis for caching because of low latency"
```

**Why:** Provides context for reviewers and prevents re-litigating settled decisions.

## Common Pitfalls

### Pitfall 1: Skipping Pre-Commit Checks

**Problem:** Using `--no-verify` to bypass checks.

**Solution:** Fix the issues properly. If you need to skip checks, work in `scripts/lab/`.

```bash
# Bad
git commit --no-verify

# Good
bun run check
git commit
```

### Pitfall 2: Not Performing Handoffs

**Problem:** Ending sessions without recording handoffs.

**Solution:** Always perform a handoff before ending the session.

```bash
td handoff <issue-id> \
  --done "Completed X" \
  --remaining "Need to do Y" \
  --decision "Chose approach Z"
```

### Pitfall 3: Ignoring Review Feedback

**Problem:** Pushing updates without addressing review comments.

**Solution:** Address all review comments before pushing updates.

```bash
# Read review comments
gh pr view <pr-number> --comments

# Make fixes
# ...

# Push updates
git push
```

### Pitfall 4: Deleting Worktrees Too Early

**Problem:** Deleting worktrees immediately after creating a PR.

**Solution:** Keep worktrees until the PR is approved.

```bash
# Keep worktree
git worktree list

# Delete only after merge
git worktree remove <worktree-path>
```

### Pitfall 5: Spamming Notifications

**Problem:** Sending notifications for routine events.

**Solution:** Only notify for signals requiring immediate attention.

```bash
# Good - notify for critical issues
notify "PR #123 has critical security vulnerabilities"

# Bad - notify for routine updates
notify "PR #123 lint check passed"
```

## References

- [AGENTS.md](../AGENTS.md) – Project constitution and agent guidelines
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns and best practices
- [Nushell Agent Playbook](./nushell-agent-playbook.md) – Nushell integration for task state
- [Edinburgh Protocol Playbook](./edinburgh-protocol.md) – Decision-making under uncertainty
- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [GitHub Actions Documentation](https://docs.github.com/en/actions) – Workflow automation
- [ntfy.sh Documentation](https://ntfy.sh/) – Push notification service

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team

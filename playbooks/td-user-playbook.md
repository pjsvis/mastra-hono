---
name: td-user
description: End-user playbook for managing work with the td CLI across AI-assisted sessions.
---

# TD User Playbook

## Purpose
Use `td` as your persistent task system for planning, tracking, and handing off work across human and AI agent sessions. This playbook defines how you should start work, log decisions, hand off context, and submit/approve reviews.

## Core Principles
1. **Start every session with visibility.** Always check open work before doing anything else.
2. **One task per focus.** Keep your session scoped to a single `td` issue whenever possible.
3. **Log decisions and blockers.** This is your external memory and audit trail.
4. **Mandatory handoff.** Every session ends with a structured handoff to prevent lost context.
5. **Review separation.** The session that implements work must not approve it.

## Quick Start (Checklist)
1. `td usage --new-session`
2. `td start <issue-id>` (or `td create ...`)
3. `td focus <issue-id>`
4. Work + log decisions
5. `td handoff <issue-id> ...`
6. `td review <issue-id>` (submit for review)

### Session End Checklist (Required)
- Run `td handoff <issue-id>` with done/remaining/decision/uncertain.
- If work is complete, submit `td review <issue-id>`.
- Do not end the session without a handoff.

---

## Commands You’ll Use Daily

### Session Start
```/dev/null/td-user-playbook.md#L1-6
td usage --new-session
td list
td query "status = in_progress"
```

### Create & Link Work
```/dev/null/td-user-playbook.md#L1-11
td create "Implement feature X" --type feature --priority P1
td epic create "Feature X System" --priority P0
td create "Child task" --parent td-abc123
```

### Focus & Progress
```/dev/null/td-user-playbook.md#L1-9
td start <issue-id>
td focus <issue-id>
td log "Implemented core logic"
td log --decision "Chose approach A because of performance"
td log --blocker "Waiting on API keys"
```

### Handoff (Mandatory)
```/dev/null/td-user-playbook.md#L1-9
td handoff <issue-id> \
  --done "Completed item 1, Completed item 2" \
  --remaining "Item 3, Item 4" \
  --decision "Used standard library to minimize dependencies" \
  --uncertain "Should we handle edge case Z?"
```

### Review Workflow
```/dev/null/td-user-playbook.md#L1-9
td review <issue-id>
td reviewable
td context <issue-id>
td files <issue-id>
td approve <issue-id>
td reject <issue-id> --reason "Missing tests"
```

---

## Recommended Workflow

### 1) Plan
- Start with `td usage --new-session` to see open work.
- If no task exists, create one.
- Break down work into child tasks if needed.

### 2) Execute
- `td start` and `td focus` the task.
- Log key decisions and blockers as you go.

### 3) Handoff
- Always run a `td handoff` before your session ends.

### 4) Review & Merge
- Submit work for review with `td review`.
- A different session approves with `td approve`.

---

## Example: Full Process (Command Line + AI Tools)

This example shows a full loop using the command line and an AI assistant. Replace placeholders with your actual IDs.

### A) Start the session and pick work
```/dev/null/td-user-playbook.md#L1-9
td usage --new-session
td list
td create "Fix auth redirect bug" --type bug --priority P1
td start td-abc123
td focus td-abc123
```

### B) Launch your AI agent and set the task context
```/dev/null/td-user-playbook.md#L1-5
# Start your AI coding agent (Claude Code, Cursor, Codex, etc.)
claude
```

**Prompt to your AI agent:**
- “Use `td` for task management. Current task: `td-abc123`. Review existing code, propose a fix, implement, and log decisions.”

### C) Log decisions during development
```/dev/null/td-user-playbook.md#L1-7
td log --decision "Redirect fix should happen in middleware to avoid route duplication"
td log "Updated auth middleware to normalize redirect target"
```

### D) Submit for review and handoff
```/dev/null/td-user-playbook.md#L1-10
td handoff td-abc123 \
  --done "Updated auth middleware; added tests for redirect behavior" \
  --remaining "Verify edge cases with query params" \
  --decision "Handled redirect normalization in middleware" \
  --uncertain "Need confirmation on legacy URL behavior"

td review td-abc123
```

### E) Reviewer session (separate session)
```/dev/null/td-user-playbook.md#L1-8
td usage --new-session
td reviewable
td context td-abc123
td files td-abc123
td approve td-abc123
```

---

## Parallel Agents: Build + Review (Two Sessions)

Use this when you want one agent to implement while another reviews in parallel. The key is **separate sessions** and **separate `td usage --new-session` calls**.

### Session A — Build Agent
```/dev/null/td-user-playbook.md#L1-11
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
```/dev/null/td-user-playbook.md#L1-8
td usage --new-session
td reviewable
td context td-abc123
td files td-abc123
td approve td-abc123
```

### Practical Setup
- Two chat windows (or two terminals), one per agent.
- Each session runs `td usage --new-session` once at start.
- Only the reviewer approves.

### Zed Session Scope Note
- Each **Zed chat panel** is its own agent session.
- Run `td usage --new-session` **once per chat panel** at the start.
- Opening a new terminal **does not** start a new `td` session; it’s just another shell.

---

## Best Practices

- **Always start with `td usage --new-session`.**
- **Avoid multi-tasking.** One focused `td` issue per session is ideal.
- **Write clear handoffs.** The next person or agent should be able to resume immediately.
- **Keep logs short but meaningful.** Emphasize decisions and blockers.
- **Never approve your own work in the same session.**

---

## Common Pitfalls

- Skipping `td usage --new-session` and missing existing tasks.
- Forgetting to log key decisions (leading to repeated debates).
- Ending a session without `td handoff`.

---

## Summary
`td` is your durable memory across human and AI sessions. Use it consistently to reduce context loss, speed reviews, and keep work moving.
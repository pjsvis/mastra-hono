---
id: PB-001
title: "Agentic Integrity Playbook"
role: "Review | Orchestrate"
infrastructure: [td, gh-aw, ntfy]
last_updated: "2026-03-26"
tags: [playbook]
---

# Agentic Integrity Playbook

Symmetric Mentation: split **delivery** (local execution) from **review** (cloud auditing) to maintain velocity and integrity.

**Core Philosophy:** High-velocity execution + sovereign auditing = quality without slowdown.

## Workflow

### Phase A: Delivery (Local)

```bash
# 1. Start session
td usage --new-session

# 2. Forge (pick brief → create task)
bun run forge

# 3. Implement following AGENTS.md

# 4. Local verify
bun run check

# 5. Finish (auto-checks + debrief + PR)
bun run finish

# 6. Handoff
td handoff <id> --done "..." --remaining "..." --decision "..."
```

### Phase B: Review (Cloud)

```bash
# 1. Check PRs
gh pr list

# 2. Fix issues → push

# 3. Verify
bun run check

# 4. Approve
td reviewable
td approve <id>
```

### Phase C: Human Merge

```bash
# Merge in GitHub UI or:
gh pr merge <pr-number> --merge

# Cleanup
td close <id>
```

---

## Reference

### Required Artifacts

1. **AGENTS.md** — Constitution for agents (tech stack, patterns, forbidden actions)
2. **review.md** — Cloud reviewer instructions
3. **conceptual-lexicon.json** — Agent persona alignment

### Key Commands

| Command | Purpose |
|---------|---------|
| `td usage --new-session` | Initialize session, see work territory |
| `bun run forge` | Pick brief → create task |
| `bun run check` | Local verification (lint + types + tests) |
| `bun run finish` | Auto-check + debrief + PR |
| `bun run ask "?"` | Ping human via ntfy |
| `td handoff` | Record context for next agent |

### Infra Setup

```bash
# Local
td init --name <project>
alias notify='curl -d "$1" ntfy.sh/<topic>'

# Cloud
gh aw init
gh secret set NTFY_URL --body "https://ntfy.sh/<topic>"
```

### Verification

```bash
gh --version
gh aw --version
td --version
git worktree --version
```

---

## Best Practices

- **Always start with** `td usage --new-session`
- **Use** `bun run ask` when confused
- **Run** `bun run check` before committing
- **Perform handoffs** before context window ends
- **Keep worktrees** until PR is approved
- **Notify only** for signals requiring immediate attention

---

## Setup

**Installation & Configuration:** See [Playbook Setup Guide](../playbook-setup.md)

---

## See Also

- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and PR workflow
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading pattern
- [Playbook Setup Guide](../playbook-setup.md) – Tool installation

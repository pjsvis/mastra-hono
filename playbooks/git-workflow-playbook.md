# Git & TD Workflow Playbook

This playbook defines our expected workflow for branching, using Sidecar workspaces, and managing task reviews using the `td` CLI.

## 1. Branching & Workspaces

We use Sidecar Workspaces to manage parallel development and git worktrees.

1. **Never work directly on `main`.**
2. **Open Sidecar:** Use `sidecar` in the terminal.
3. **Create a Workspace:** Press `n` in the Workspaces plugin to create an isolated branch/worktree.
4. **Link to a Task:** Press `t` to link your active `td` issue to the workspace. This ensures the context is persisted specifically for this branch.

## 2. The TD Flow

### A. Picking up work
Start every new feature or bug fix by identifying its `td` issue.
```bash
td usage --new-session
td start <issue-id>
td focus <issue-id>
```

### B. During Development
Log your decisions and blockers. This acts as breadcrumbs for reviewers or other agents that might resume this session.
```bash
td log --decision "Chose approach X because Y"
```

### C. Context Handoffs
When you are done for the day or the agent's context window is ending, you **must** perform a handoff. This prevents the next agent/developer from hallucinating state.
```bash
td handoff <issue-id> \
  --done "Implemented A and B" \
  --remaining "Need to test C" \
  --decision "Used a fast path for D"
```

## 3. Reviews & Merging

We enforce a strict separation between implementation and approval.

1. **Submit for Review:** Once your work in the workspace is complete, and your tests pass, run:
   ```bash
   td review <issue-id>
   ```
2. **Merge Workflow:** Use Sidecar's merge workflow by pressing `m` in the Workspaces plugin to commit, push, create a PR, and optionally clean up the worktree.
3. **Approval:** A different session (a human or another agent instance) must review the PR, run `td reviewable`, and execute `td approve <issue-id>`.

## 4. Resolving Conflicts
If you encounter biome or type issues preventing a commit:
1. Do not use `--no-verify`.
2. Fix the issues properly. If you are experimenting, move the experimental code to `scripts/lab/` where type-safety is disabled.
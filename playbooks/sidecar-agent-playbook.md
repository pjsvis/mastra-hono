---
name: sidecar-agent
description: AI agent integration patterns for Sidecar including task management with td, workspace workflows, conversation tracking, and development best practices.
allowed-tools: Bash(sidecar), Bash(td), Bash(git)
---

# Sidecar Agent Playbook

## Purpose
This playbook defines how AI agents should integrate with Sidecar for development workflows, task tracking, workspace management, and code quality standards. It is critical for agents to use `td` as structured external memory to persist context across sessions.

## Mandatory Directives

### 1. Mandatory Session Check
Always run `td usage --new-session` at the beginning of your work to see open work and view tasks/epics.

### 2. Mandatory Task Creation
If a human does not provide an existing task for your work, you *must* create a task (or tasks) using `td` first and use it to track your progress.

```bash
# Create an issue
td create "Implement feature X" --type feature --priority P1

# Create an epic
td epic create "Feature X System" --priority P0

# Link child issue to an epic
td create "Child task" --parent td-abc123
```

### 3. Tracking Progress
Use `td` to track progress and link tasks to workspaces when applicable. Sidecar's TD Monitor plugin provides visibility into task progress.

```bash
# Start an issue (moves from open to in_progress)
td start <issue-id>

# Focus your session on a specific issue
td focus <issue-id>

# Log progress, decisions, or blockers
td log "Implemented core logic"
td log --decision "Chose approach A because of performance"
td log --blocker "Waiting on API keys"
```

### 4. Mandatory Handoffs (Crucial)
Before your context window ends, ALWAYS run a handoff command. This ensures the next session resumes exactly where you stopped, preventing hallucinated progress or repeated work.

```bash
td handoff td-abc123 \
  --done "Completed item 1, Completed item 2" \
  --remaining "Item 3, Item 4" \
  --decision "Used standard library to minimize dependencies" \
  --uncertain "Should we handle edge case Z?"
```

### 5. Review Workflow
The session that implements the code *cannot* approve it. This enforces review separation.

```bash
# Submit your work for review
td review <issue-id>

# To review others' work (must be in a different session)
td reviewable                 # List pending reviews
td context <issue-id>         # Read full handoff
td files <issue-id>           # Check modified files
td approve <issue-id>         # Approve and close
td reject <issue-id> --reason "Missing tests"
```

### 6. Querying State
```bash
td list                          # List open issues
td query "status = in_progress"  # Advanced query
td critical-path                 # See optimal work sequence
td dep add <issue> <depends>     # Add a dependency
```

## Integration Patterns

### Pattern 1: Plugin Development Guidelines

When developing Sidecar plugins, follow these constraints:

#### Height Constraints
```go
// Always constrain plugin output height
func (p *Plugin) View(width, height int) string {
    p.width, p.height = width, height
    
    // Calculate internal layout respecting height
    content := p.renderContent()
    
    // Use lipgloss.Height to limit rendered lines
    return lipgloss.Height(height).Render(content)
    // OR manually limit rendered lines
}
```

**Critical:** The app's header/footer are always visible. Plugins must not exceed allocated height or the header will scroll off-screen.

#### Footer/Command Hints
```go
// DO NOT render footers in plugin View()
// The app renders unified footer using plugin.Commands()

// Define commands with short names in Commands() method
func (p *Plugin) Commands() []string {
    return []string{"stage", "unstage", "diff", "commit"}
    // Keep names short (1 word preferred) to prevent wrapping
}
```

#### Inter-Plugin Communication
Plugins communicate via `tea.Msg` broadcast:

```go
// Example: Open file in file browser from another plugin
func (p *Plugin) openInFileBrowser(path string) tea.Cmd {
    return tea.Batch(
        app.FocusPlugin("file-browser"),
        func() tea.Msg {
            return filebrowser.NavigateToFileMsg{Path: path}
        },
    )
}
```

**Available messages:**
- `FocusPluginByIDMsg{PluginID}` - Switch focus to a plugin
- `NavigateToFileMsg{Path}` - Navigate to and preview a file (from filebrowser plugin)

### Pattern 2: Workspace Workflow

When working with Sidecar workspaces (git worktrees):

```bash
# 1. Create workspace for feature ('n' in Workspaces plugin or via td)
# 2. Link TD task for context ('t' in Workspaces plugin or `td link`)
# 3. Launch agent from workspace ('a' in Workspaces plugin)
# 4. Complete work and merge ('m' for merge workflow: commit → push → PR → cleanup)
```

### Pattern 3: Git Operations via Sidecar

When Sidecar is running, prefer using its Git plugin for staging and committing to maintain workspace state consistency.

```bash
# Stage files: Press 's'
# Review diffs: Press 'd' (full-screen) or 'v' (side-by-side)
# Commit: Press 'c'
```

### Pattern 4: Conversation Tracking

Sidecar auto-captures conversations from supported agents (Claude Code, Codex, Cursor CLI, Gemini CLI, Kiro, OpenCode, Pi Agent, Warp, Amp Code). Use `/` to search past sessions when resuming work and track token usage.

## Configuration & Development Workflow

### Workspace tmux Preview
Configure tmux capture max bytes in `~/.config/sidecar/config.json`:
```json
{
  "plugins": {
    "workspace": { "tmuxCaptureMaxBytes": 102400 }
  }
}
```

### Build & Version Standards
```bash
# Format and lint
make fmt && make lint

# Run tests before committing
make test
# or: go test ./...

# Build and Install with version info
make build
make install-dev
# or: go install -ldflags "-X main.Version=v0.1.0" ./cmd/sidecar
```
**Reference:** `.claude/skills/release/SKILL.md` for release procedures.

## Keyboard Shortcuts Reference

| Key | Action | Context |
|-----|--------|---------|
| `a` | Launch/attach agent | Workspaces plugin |
| `t` | Link/unlink TD task | Workspaces plugin |
| `m` | Start merge workflow | Workspaces plugin |
| `s` | Stage file | Git plugin |
| `u` | Unstage file | Git plugin |
| `c` | Commit staged | Git plugin |
| `d` | View diff | Git plugin |
| `n` | New workspace | Workspaces plugin |
| `D` | Delete workspace | Workspaces plugin |
| `r` | Refresh/TD review | Any plugin |
| `j/k`, `↓/↑` | Navigate items | Global |
| `tab` / `shift+tab` | Next/Prev plugin | Global |
| `1-9` | Focus plugin by number | Global |
| `@` | Project switcher | Global |
| `W` | Worktree switcher | Global |
| `#` | Theme switcher | Global |

## Summary

**Always:**
1. Check/create TD tasks before starting work (`td usage --new-session`).
2. Run `td handoff` before terminating a session.
3. Use workspaces for parallel development.
4. Follow plugin height constraints when developing and use short command names (1 word).
5. Run tests before committing.

**Never:**
1. Start work without a linked task.
2. Render footers in plugin `View()` methods.
3. Exceed plugin height allocation.
4. Use relative imports in Go code.
5. Commit without running tests.
6. Approve your own code in the same session it was implemented.
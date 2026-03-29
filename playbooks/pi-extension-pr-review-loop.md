---
id: PB-pr-review-loop
title: "PR Review Loop Extension"
role: "Operate"
infrastructure: [pi-extension]
last_updated: "2026-03-29"
tags: [playbook, pi-extension, github, automation]
---

# PR Review Loop Extension

## Purpose
Monitors GitHub PR reviews and automatically fixes issues until resolved or escalated to human-in-the-loop. Designed for eventual-consistency workflows where AI reviews settle asynchronously.

## Architecture

### State Persistence
Uses a PID-like state file pattern: `~/.ctx/pr-watch-state.json`

```typescript
interface MonitoringState {
  prNumber: number;
  owner: string;
  repo: string;
  lastCheck: Date;
  issues: ReviewIssue[];
  lastCommitSha: string;
  pollIntervalMs: number;
  rateLimitReset?: Date;
}
```

**Behavior:**
- **On watch**: Creates state file
- **On reload/restart**: Loads state file, resumes monitoring
- **On stop**: Deletes state file

### Polling Cadence
PR reviews are eventual consistency - not real-time.

| Scenario | Interval |
|----------|----------|
| Default | 5 minutes |
| After rate limit | Waits for reset + 10s buffer |
| Max backoff | 30 minutes |
| Min interval | 2 minutes |

### Issue Classification

**Fixable (auto-fix):**
- Missing code, undefined references, type errors
- Lint/style violations
- Test failures, missing tests
- Security/best practice issues

**Unfixable (escalate to human):**
- Architecture decisions
- Design reconsiderations
- Questions requiring judgment

## Commands

| Command | Description |
|---------|-------------|
| `/pr-watch <number>` | Start monitoring a PR |
| `/pr-status` | Show current monitoring status |
| `/pr-fix [--dry-run]` | Fix review issues |
| `/pr-escalate [reason]` | Hand off unfixable issues |
| `/pr-stop` | Stop monitoring |

## Tools

| Tool | Purpose |
|------|---------|
| `pr_status` | Get current monitoring status |
| `pr_watch` | Start watching (programmatic) |
| `pr_fix_issues` | Analyze and queue fixes |
| `pr_escalate` | Notify human via ntfy |

## Workflow

```
User: /pr-watch 42
  ↓
Extension: Check ~/.ctx/pr-watch-state.json
  ↓
Start monitoring:
  - Fetch PR reviews
  - Classify issues (fixable/unfixable)
  - If fixable → queue fix → commit → push
  ↓
Polling loop (5min cadence):
  - Check for new reviews
  - If issues found → repeat fix cycle
  - If rate limited → adaptive backoff
  ↓
Final states:
  - All issues resolved → notify success
  - Unfixable issues → escalate to human
```

## Configuration

Environment variables:
- `GITHUB_TOKEN` or `GH_TOKEN` - GitHub API token
- `NTFY_TOPIC` - Optional ntfy.sh topic for escalation notifications

## Edge Cases

### Extension Reload
- State persists to file
- On reload, `session_start` handler loads state and resumes
- User should run `/pr-status` to confirm resume

### Rate Limiting
- Detects 403/429 responses
- Queries `gh api rate_limit` for reset time
- Adaptive backoff with exponential increase

### Stale Comments
- Bots don't auto-resolve comments on new commits
- May need empty commit to trigger fresh review
- Comments marked as "info" severity if on old commit

### Network Failures
- Catches fetch errors
- Does not clear state on transient failures
- Logs error, continues polling

## Testing Pattern

See [pi-extension-testing.md](./pi-extension-testing.md) for testing harness details.

### Quick Test Commands

```bash
# Test extension loads
cd ~/.pi/agent/extensions/pr-review-loop
node --check index.ts

# Test GitHub API connectivity
gh api repos/pjsvis/mastra-hono/pulls/11

# Check state file
cat ~/.ctx/pr-watch-state.json

# Clear state manually
rm ~/.ctx/pr-watch-state.json
```

## Debugging

### Extension not loading
- Check for syntax errors: `node --check index.ts`
- Verify dependencies: `npm ls @sinclair/typebox`

### Monitoring not resuming after reload
- Check state file exists: `cat ~/.ctx/pr-watch-state.json`
- Check `session_start` handler fires
- Review pi session logs

### Rate limit loops
- Check `gh api rate_limit` for current limits
- Verify token has correct scopes

### Stale review comments
- Bots may need manual re-trigger via new commit
- Check commit SHA matches in API response

## References

- [Pi Extensions Documentation](../.pi/extensions/)
- [CLI Design Playbook](./cli-design-playbook.md)
- [Fabric Agent Playbook](./fabric-agent-playbook.md)

---

**Version:** 1.0  
**Last Updated:** 2026-03-29  
**Maintained by:** PolyVis Development Team

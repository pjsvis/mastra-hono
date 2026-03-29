---
id: PB-TMUX
title: "tmux Session Management Playbook"
role: "DevOps | Remote Development"
infrastructure: [tmux, ssh, tailscale]
last_updated: "2026-03-26"
tags: [playbook, tmux, remote-development, tailscale]
---

# tmux Session Management Playbook

## Purpose

This playbook provides daily usage patterns and advanced workflows for tmux. For initial installation and configuration, see the [Repository Initialization Playbook](./repo-init-playbook.md#10-session-management-tmux).

---

## 1. Session Lifecycle Commands

| Command | Action |
|---------|--------|
| `tmux new -s NAME` | Create new named session |
| `tmux detach` or `Ctrl-b d` | Detach (keep running) |
| `tmux attach -t NAME` | Attach to existing session |
| `tmux new-session -A -s NAME` | Attach or create if doesn't exist |
| `tmux ls` | List all sessions |
| `tmux kill-session -t NAME` | Kill specific session |
| `tmux kill-server` | Kill **all** sessions |
| `tmux rename-session -t OLD NEW` | Rename session |

---

## 2. Window and Pane Management

### Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl-b c` | Create new window |
| `Ctrl-b n` | Next window |
| `Ctrl-b p` | Previous window |
| `Ctrl-b w` | Window list (interactive) |
| `Ctrl-b 0-9` | Switch to window number |
| `Ctrl-b %` | Split vertically |
| `Ctrl-b "` | Split horizontally |
| `Ctrl-b x` | Kill pane |
| `Ctrl-b z` | Zoom pane (toggle) |
| `Ctrl-b [` | Enter scroll mode (vi keys) |

---

## 3. Resource Management

### The Problem: Zombie Sessions

Idle tmux sessions consume resources:
- **Memory**: 5-20MB per session (scrollback buffer)
- **CPU**: Near zero when idle
- **Processes**: Background processes continue running
- **Disk**: Scrollback history accumulates

### Auto-Cleanup Script

See [repo-init playbook](./repo-init-playbook.md#auto-cleanup-of-old-sessions) for the cleanup script setup.

Quick reference:
```bash
# List all sessions
tmux ls

# Kill specific session
tmux kill-session -t NAME

# Kill all sessions (nuclear option)
tmux kill-server
```

---

## 4. Tailscale Integration

### Option A: SSH over Tailscale (Recommended)

```bash
# SSH via Tailscale MagicDNS
ssh user@myserver.tailnet-name.ts.net

# Then tmux as normal
tmux new -s dev
```

### Option B: Tailscale SSH (Native)

```bash
# On the remote machine, enable Tailscale SSH
sudo tailscale up --ssh

# From any tailnet device
tailscale ssh user@myserver

# Then tmux as normal
tmux new -s dev
```

### Best Practice Workflow

```bash
# 1. Ensure Tailscale is up
tailscale status

# 2. SSH to remote (encrypted end-to-end)
tailscale ssh user@devbox

# 3. Create or attach to session
tmux new-session -A -s main

# 4. Work in persistent environment
#    - Multiple windows: Ctrl-b c (create), Ctrl-b n (next)
#    - Split panes: Ctrl-b % (vertical), Ctrl-b " (horizontal)
#    - Detach: Ctrl-b d

# 5. Later: reconnect from anywhere in your tailnet
tailscale ssh user@devbox
tmux attach -t main
```

---

## 5. iPad Mini + Echo Terminal

**Echo Terminal** is an iOS SSH client with excellent tmux support.

### Setup

1. **Install Echo Terminal** from the App Store
2. **Add a Connection**:
   - Host: `myserver.tailnet-name.ts.net` (Tailscale MagicDNS)
   - Or use Tailscale IP: `100.x.x.x`
   - Port: `22`
   - Authentication: SSH Key or Password

### Connection Method

Echo Terminal provides a streamlined connection flow:

| Feature | Benefit |
|---------|---------|
| **Tailscale-aware** | Auto-detects Tailscale network |
| **Key Management** | Secure enclave for SSH keys |
| **Touch Gestures** | Swipe between tmux panes |
| **Hardware Keyboard** | Full support for Ctrl-b shortcuts |
| **Clipboard Sync** | Copy/paste between iPad and remote |

### Workflow on iPad

```bash
# 1. Open Echo Terminal
# 2. Tap your saved connection
# 3. Once connected, start or attach to tmux
tmux new-session -A -s ipad

# 4. Work with touch-friendly shortcuts:
#    - Two-finger swipe: Scroll
#    - Three-finger tap: Show/hide keyboard
#    - Cmd+K: Clear screen
#    - Cmd+T: New window (if enabled in Echo)

# 5. Detach when done
Ctrl-b d

# 6. Echo Terminal maintains connection in background
#    - Reopen app to resume
#    - tmux session persists on server
```

### Optimizing for iPad

See [repo-init playbook](./repo-init-playbook.md#basic-configuration-tmuxconf) for the full configuration, including iPad-optimized settings like:
- Larger scrollback for smaller screen
- Simpler status bar for narrow displays
- Mouse support for touch

### External Keyboard Shortcuts

When using an external keyboard (Magic Keyboard, etc.):

| Key Combo | Action |
|-----------|--------|
| `Ctrl-b c` | New window |
| `Ctrl-b n/p` | Next/previous window |
| `Ctrl-b d` | Detach (keep session running) |
| `Cmd-Tab` | Switch iPad apps (Echo stays connected) |

### Identifying tmux vs SSH Session

On iPad Mini's smaller screen, it's easy to lose track. Use these methods:

**1. Visual Indicator (Status Bar)**
```bash
# Add to ~/.tmux.conf - shows [tmux] in green when inside tmux
set -g status-left '#[fg=green,bold][tmux] #[fg=blue]#S #[default]'
```

**2. Quick Check Commands**
```bash
# If this returns a number, you're in tmux
echo $TMUX

# Check for tmux environment variable
env | grep TMUX

# Show current session name (only works inside tmux)
tmux display-message -p '#S'
```

**3. Prompt Indicator**
Add to your shell profile (`~/.bashrc` or `~/.zshrc`):
```bash
# Show 🟢 in prompt when inside tmux
if [[ -n "$TMUX" ]]; then
    export PS1="🟢 $PS1"
fi
```

**4. The Foolproof Test**
```bash
# Try to detach - if it works, you were in tmux
Ctrl-b d

# If you get '^B' characters instead, you're NOT in tmux
```

**5. iPad-Specific Tip**
```bash
# Create an alias to check status
alias am-i-in-tmux='tmux info >/dev/null 2>&1 && echo "✅ In tmux session: $(tmux display-message -p '#S')" || echo "❌ Not in tmux (plain SSH)"'

# Use it anytime you're unsure
am-i-in-tmux
```

---

## 6. Recovery Patterns

### Session Won't Attach

```bash
# Force attach (detach from elsewhere)
tmux attach -d -t session-name

# If truly stuck, kill and restart
tmux kill-session -t session-name
tmux new -s session-name
```

### Network Disconnect While in tmux

```bash
# Simply reconnect and reattach
ssh user@host
tmux attach -t session-name
```

---

## 7. Quick Reference

```bash
# Daily workflow
ssh devbox                                    # Connect to remote
tmux new-session -A -s main                   # Create or attach
# ... work ...
Ctrl-b d                                       # Detach
exit                                          # Disconnect SSH

# Later
ssh devbox && tmux attach -t main             # Resume exactly where you left off
```

---

## References

- [tmux man page](https://man7.org/linux/man-pages/man1/tmux.1.html)
- [Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh)
- [Echo Terminal](https://echo-terminal.app) - iOS SSH client with tmux support
- [Repository Initialization Playbook](./repo-init-playbook.md#10-session-management-tmux) - Installation and configuration

---

**Version:** 2.3  
**Last Updated:** 2026-03-26  
**Maintained by:** PolyVis Development Team
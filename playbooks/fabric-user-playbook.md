---
id: PB-010
title: "Fabric User Playbook"
role: "Orchestrate"
infrastructure: [fabric]
last_updated: "2026-03-26"
tags: [playbook]
---

# Fabric User Playbook

Fabric provides 250+ reusable AI patterns for summarizing, analyzing, extracting, and transforming content. Pipe content through patterns via stdin/stdout.

**Core Philosophy:** Patterns over prompts. Stream for speed.

## Usage

### Common Patterns

```bash
# Summarize (most common)
fabric -u https://example.com/article -p summarize
cat document.txt | fabric -p summarize
cat long-article.txt | fabric -sp summarize  # streaming

# Extract insights
cat article.txt | fabric -p extract_ideas
cat meeting-notes.txt | fabric -p extract_actions

# Code tasks
cat script.py | fabric -p explain_code
git diff main | fabric -p write_pull-request

# Writing
cat draft.md | fabric -p improve_writing

# Analysis
cat article.txt | fabric -p analyze_claims
```

### Pattern Discovery

```bash
fabric --listpatterns | grep summary
fabric --listpatterns | grep code
fabric --listmodels
```

### Chaining Patterns

```bash
# Extract then summarize
cat article.txt | fabric -p extract_ideas | fabric -p summarize

# Pipe to clipboard (macOS)
cat file.txt | fabric -p summarize -c
```

### Model Selection

```bash
# Fast model (default)
fabric -p summarize

# Powerful model
fabric -p summarize -m gpt-4

# Local model (no API key)
fabric -p summarize -m llama2
```

### Git Workflows

```bash
git diff --staged | fabric -p create_git_commit_message
git diff main..feature | fabric -p write_pull-request
```

---

## Reference

### Pattern Library

| Pattern | Purpose |
|---------|---------|
| `summarize` | General summarization |
| `extract_ideas` | Pull key ideas |
| `extract_wisdom` | Extract insights |
| `explain_code` | Code explanation |
| `analyze_claims` | Evaluate arguments |
| `improve_writing` | Enhance writing |
| `write_pull-request` | PR descriptions |

### Advanced Usage

**Context preservation:**
```bash
cat context.md | fabric -p summarize -c my-context
echo "Follow-up?" | fabric -p ai -C my-context
```

**Chain patterns:**
```bash
cat article.txt | fabric -p extract_ideas | fabric -p summarize
```

**Custom patterns:** Create `~/.config/fabric/patterns/my-pattern/system.md`:
```markdown
# IDENTITY
You are an expert at [task].

# GOAL
Your goal is to [outcome].

# OUTPUT FORMAT
[format description]
```

### Tips

```bash
# Aliases for ~/.zshrc
alias fsumm='fabric -p summarize'
alias fwisdom='fabric -p extract_wisdom'

# Shell functions
furl() { fabric -u "$1" -p summarize; }
```

---

## Setup

**Installation & Configuration:** See [Playbook Setup Guide](../playbook-setup.md)

Quick setup:
```bash
# Install
curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/scripts/installer/install.sh | bash

# API keys
nano ~/.config/fabric/.env
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Update patterns
fabric --updatepatterns

# Verify
fabric --version
```

---

## See Also

- [Fabric Agent Playbook](./fabric-agent-playbook.md) – Agent-specific usage
- [Playbook Setup Guide](../playbook-setup.md) – Installation & configuration

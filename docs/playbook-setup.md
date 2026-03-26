---
title: "Playbook Setup Guide"
description: "Installation and configuration prerequisites for all playbooks"
last_updated: "2026-03-26"
tags: [playbook, meta]
---

# Playbook Setup Guide

This document contains one-time setup instructions for all playbooks. Once configured, you rarely need to revisit this content.

## Quick Setup Checklist

- [ ] Install required tools (see individual sections below)
- [ ] Configure API keys via environment variables
- [ ] Verify installations with `--version` or `-v`

---

## Tool Installations

### Fabric

**macOS/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/scripts/installer/install.sh | bash
```

**Verify:**
```bash
fabric --version
```

**API Keys:** Edit `~/.config/fabric/.env`:
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

### Nushell

**Homebrew (macOS):**
```bash
brew install nushell
```

**Verify:**
```bash
nu --version
```

**Note:** Nushell is self-contained with no additional dependencies.

---

### Sidecar

**Requirements:**
- Nushell with `nu-plugin-jupyter` or `nu-plugin-stdlib`
- Jupyter kernel registration

**Verify:**
```bash
sidecar --version  # or appropriate CLI name
```

---

## Environment Setup

### Skate (Secret Management)

All projects use Skate for secrets. Do NOT use `.env` files.

```bash
# Set secrets via Skate
skate set OPENAI_API_KEY "your-key"
skate set ANTHROPIC_API_KEY "your-key"

# Load in scripts via src/lib/secrets.ts
```

### Ollama (Local Models)

```bash
# Install Ollama
brew install ollama

# Pull models
ollama pull llama2
ollama pull codellama

# Verify
ollama list
```

---

## Verification Commands

Run these to verify your setup:

```bash
# Tool versions
fabric --version
nu --version
ollama list

# API connectivity (example)
echo "test" | fabric -p summarize

# Skate secrets loaded
source <(skate env)
```

---

## Troubleshooting

### API Key Issues

1. Check Skate is loaded: `skate list`
2. Reload environment: `source <(skate env)`
3. Verify key format (no trailing spaces, correct prefix)

### Installation Issues

```bash
# Re-run installation
curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/scripts/installer/install.sh | bash

# Update patterns (for fabric)
fabric --updatepatterns
```

---

## Sidecar

**macOS:**
```bash
brew install marcus/tap/sidecar
```

**Verify:**
```bash
sidecar --version
```

---
id: PB-002
title: "Agentic Integrity Retrofit Guide"
role: "Orchestrate"
infrastructure: [td, bun]
last_updated: "2026-03-21"
tags: [playbook]
---

# Agentic Integrity Retrofit Guide

## Table of Contents

- [Purpose](#purpose)
- [Core Script Porting](#core-script-porting)
  - [Required Scripts](#required-scripts)
  - [Script Customization](#script-customization)
  - [Verification](#verification)
- [Directory Structure](#directory-structure)
  - [Required Directories](#required-directories)
  - [Directory Purposes](#directory-purposes)
  - [Optional Directories](#optional-directories)
- [package.json Integration](#packagejson-integration)
  - [Required Scripts](#required-scripts)
  - [Script Descriptions](#script-descriptions)
  - [Customizing the `verify` Script](#customizing-the-`verify`-script)
- [The Agent Constitution (AGENTS.md)](#the-agent-constitution-agentsmd)
  - [Required Sections](#required-sections)
  - [Example Template](#example-template)
- [Local Environment Setup](#local-environment-setup)
  - [Step 1: Initialize `td`](#step-1-initialize-`td`)
  - [Step 2: Haptic Alias (Optional but Recommended)](#step-2-haptic-alias-optional-but-recommended)
  - [Step 3: Verify Setup](#step-3-verify-setup)
- [The "Map of Knowledge" Protocol](#the-"map-of-knowledge"-protocol)
  - [Required Links](#required-links)
  - [Implementation](#implementation)
  - [Benefits](#benefits)
- [Retrofit Checklist](#retrofit-checklist)
  - [Infrastructure](#infrastructure)
  - [Scripts](#scripts)
  - [Configuration](#configuration)
  - [Testing](#testing)
  - [Documentation](#documentation)
- [Best Practices](#best-practices)
  - [1. Keep Scripts Simple](#1-keep-scripts-simple)
  - [2. Use Absolute Paths Where Possible](#2-use-absolute-paths-where-possible)
  - [3. Make Scripts Executable](#3-make-scripts-executable)
  - [4. Test Scripts Before Committing](#4-test-scripts-before-committing)
  - [5. Document Customizations](#5-document-customizations)
  - [6. Keep `AGENTS.md` Up to Date](#6-keep-`agentsmd`-up-to-date)
- [Common Issues](#common-issues)
  - [Issue 1: Scripts Not Executable](#issue-1-scripts-not-executable)
  - [Issue 2: `NTFY_TOPIC` Not Configured](#issue-2-`ntfy_topic`-not-configured)
  - [Issue 3: `verify` Script Fails](#issue-3-`verify`-script-fails)
  - [Issue 4: `td` Not Initialized](#issue-4-`td`-not-initialized)
  - [Issue 5: Directories Not Created](#issue-5-directories-not-created)
- [References](#references)

## Purpose
This guide provides the technical steps to port the **Agentic Integrity Workflow** (Symmetric Mentation) to any new or existing repository. It serves as a comprehensive migration guide for teams adopting the workflow, ensuring consistency across projects while allowing for project-specific customization.

**Core Philosophy:** Standardize the workflow infrastructure while allowing flexibility in implementation details. The workflow should be portable and reproducible across different tech stacks.


## Core Script Porting

Copy the following standard scripts from `mastra-hono/scripts/` to your target repo. These scripts form the backbone of the Agentic Integrity workflow.

### Required Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `forge.sh` | Bridges Markdown briefs to `td` tasks | `scripts/forge.sh` |
| `finish.sh` | Handles verification, debriefing, PR creation, and cleanup guidance | `scripts/finish.sh` |
| `ask.sh` | Implements the "Haptic Link" via `ntfy` | `scripts/ask.sh` |

### Script Customization

Each script may require project-specific customization:

**`forge.sh` customization:**
- Update brief directory path if different from `briefs/`
- Adjust task creation logic if using different task management
- Modify briefing template if needed

**`finish.sh` customization:**
- Update verification commands to match project's test suite
- Adjust debrief generation logic if different format is needed
- Modify PR creation template if using different Git host

**`ask.sh` customization:**
- Update `NTFY_TOPIC` to your project's notification topic
- Adjust message format if different notification service is used

### Verification

After copying scripts, verify they work:

```bash
# Test forge script
bash scripts/forge.sh --help

# Test finish script
bash scripts/finish.sh --help

# Test ask script
bash scripts/ask.sh "Test message"
```

## Directory Structure

Initialize the "Map of Knowledge" folders to support the workflow:

### Required Directories

```bash
mkdir -p briefs debriefs playbooks tests/human
```

### Directory Purposes

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `briefs/` | Task briefs and requirements | Markdown files describing work to be done |
| `debriefs/` | Post-task summaries and lessons learned | Generated debriefs linked to task IDs |
| `playbooks/` | Operational guides and best practices | Playbooks for common workflows |
| `tests/human/` | Human verification test plans | Test plans for manual verification |

### Optional Directories

```bash
mkdir -p scripts/lab docs
```

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `scripts/lab/` | Experimental code | Prototypes and proofs-of-concept |
| `docs/` | Additional documentation | Project-specific documentation |

## package.json Integration

Add these mandatory scripts to your `package.json`. Customize the `verify` command based on the target project's tech stack.

### Required Scripts

```json
{
  "scripts": {
    "ask": "bash scripts/ask.sh",
    "forge": "bash scripts/forge.sh",
    "finish": "bash scripts/finish.sh",
    "verify": "bun run lint && bun run test"
  }
}
```

### Script Descriptions

| Script | Description | Usage |
|--------|-------------|-------|
| `ask` | Send a question to the human via ntfy | `bun run ask "Your question"` |
| `forge` | Create a task from a brief | `bun run forge` |
| `finish` | Complete a task and create PR | `bun run finish` |
| `verify` | Run quality checks | `bun run verify` |

### Customizing the `verify` Script

The `verify` script should run all quality checks for your project:

**For TypeScript projects:**
```json
"verify": "tsc --noEmit && bun run lint && bun run test"
```

**For JavaScript projects:**
```json
"verify": "bun run lint && bun run test"
```

**For Rust projects:**
```json
"verify": "cargo clippy && cargo test"
```

**For Python projects:**
```json
"verify": "ruff check && pytest"
```

## The Agent Constitution (AGENTS.md)

Copy `/AGENTS.md` and customize the **Tech Stack** section for the new repo. The **MANDATORY: Session Orientation** and **The Forge Lifecycle** sections should remain identical to ensure workflow consistency across the organization.

### Required Sections

The `AGENTS.md` file must include:

1. **MANDATORY: Session Orientation**
   - Instructions for starting sessions
   - Session initialization requirements
   - Context management guidelines

2. **The Forge Lifecycle**
   - Brief-to-task workflow
   - Implementation guidelines
   - Review and approval process

3. **Tech Stack** (Customizable)
   - Framework and language
   - Package manager
   - Testing framework
   - Linting tools

4. **Coding Standards** (Customizable)
   - Type safety requirements
   - Code style guidelines
   - Testing requirements

5. **Forbidden Actions** (Customizable)
   - Actions that must not be performed
   - Security considerations
   - Quality gates

### Example Template

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

## MANDATORY: Session Orientation

Run `td usage --new-session` at the absolute start of every conversation window.

## The Forge Lifecycle

1. **The Brief**: Create or select a Markdown brief in `briefs/`
2. **The Task**: Create a task with `td create` and link it to the brief
3. **The Development**: Implement the objectives
4. **The PR**: Create a PR with `bun run create-pr`
5. **The Finish**: Run `bun run finish` to complete the task
6. **The Approve**: Run `td approve <task-id>` after PR merge

## Tech Stack

- **Framework**: [Your framework]
- **Language**: [Your language]
- **Package Manager**: [Your package manager]

## Coding Standards

- No `any` types
- Zod for all schemas
- Explicit error handling
- Comprehensive test coverage

## Forbidden Actions

- Do not touch `.env` files directly
- Do not commit secrets
- Do not bypass pre-commit hooks
```

## Local Environment Setup

### Step 1: Initialize `td`

Initialize the task management system for your project:

```bash
td init --name <repo-name>
```

**What this does:**
- Creates a `.td/` directory in your project root
- Sets up the task database
- Configures the project-specific task context

### Step 2: Haptic Alias (Optional but Recommended)

Add a convenient alias to your shell config:

**For Bash:**
```bash
# Add to ~/.bashrc
alias tdn='td usage --new-session'
```

**For Zsh:**
```bash
# Add to ~/.zshrc
alias tdn='td usage --new-session'
```

**For Nushell:**
```nu
# Add to ~/.config/nushell/config.nu
alias tdn = td usage --new-session
```

**Usage:**
```bash
tdn  # Equivalent to td usage --new-session
```

### Step 3: Verify Setup

Verify that everything is working:

```bash
# Test td initialization
td usage --new-session

# Test alias (if configured)
tdn

# Verify scripts are executable
ls -la scripts/
```

## The "Map of Knowledge" Protocol

Ensure all agents in the new repo follow the structured description format. This protocol ensures that all work is traceable and documented.

### Required Links

Every task should include links to:

| Link Type | Format | Purpose |
|-----------|--------|---------|
| **Brief** | `briefs/my-brief.md` | Initial requirements and context |
| **Debrief** | `debriefs/td-id.md` | Post-task summary and lessons learned |
| **Test-Plan** | `tests/human/td-id-verification.md` | Manual verification test plan |
| **Playbook** | `playbooks/my-pattern.md` | Relevant operational guidelines |

### Implementation

When creating a task, use the following format:

```bash
td create "Task Title" \
  --brief "briefs/my-brief.md" \
  --playbook "playbooks/my-pattern.md" \
  --description "Brief: briefs/my-brief.md"
```

When completing a task, ensure the debrief is created:

```bash
# The finish script automatically creates debriefs
bun run finish
```

### Benefits

- **Traceability:** All work is linked to its requirements
- **Context Preservation:** Future agents can understand why decisions were made
- **Knowledge Sharing:** Lessons learned are captured and reusable
- **Quality Assurance:** Test plans ensure verification is documented

## Retrofit Checklist

Use this checklist to ensure a complete retrofit of the Agentic Integrity workflow.

### Infrastructure

- [ ] `td` is initialized and `tdn` works
- [ ] `scripts/` directory exists
- [ ] `briefs/` directory exists
- [ ] `debriefs/` directory exists
- [ ] `playbooks/` directory exists
- [ ] `tests/human/` directory exists

### Scripts

- [ ] `scripts/ask.sh` has been copied
- [ ] `scripts/forge.sh` has been copied
- [ ] `scripts/finish.sh` has been copied
- [ ] `scripts/ask.sh` has the correct `NTFY_TOPIC`
- [ ] `scripts/finish.sh` has the correct `NEW_DESC` rebuilding logic
- [ ] All scripts are executable (`chmod +x scripts/*.sh`)

### Configuration

- [ ] `package.json` has the `ask` script
- [ ] `package.json` has the `forge` script
- [ ] `package.json` has the `finish` script
- [ ] `package.json` has the `verify` script
- [ ] `verify` script is mapped to the project's actual test suite
- [ ] `AGENTS.md` is present in the root
- [ ] `AGENTS.md` has been customized for the project

### Testing

- [ ] `bun run ask` works and sends notifications
- [ ] `bun run forge` works and creates tasks
- [ ] `bun run finish` works and completes tasks
- [ ] `bun run verify` runs all quality checks
- [ ] `td usage --new-session` initializes sessions correctly

### Documentation

- [ ] Brief template exists in `briefs/`
- [ ] Debrief template exists in `debriefs/`
- [ ] Test plan template exists in `tests/human/`
- [ ] Project-specific playbooks exist in `playbooks/`
- [ ] All documentation follows the loading process pattern

## Best Practices

### 1. Keep Scripts Simple

Scripts should be simple and focused. Avoid complex logic in shell scripts.

**Good:**
```bash
#!/bin/bash
# Simple, focused script
bun run verify
```

**Bad:**
```bash
#!/bin/bash
# Complex, hard to maintain
if [ "$1" == "test" ]; then
  if [ "$2" == "unit" ]; then
    # ... complex logic
  fi
fi
```

### 2. Use Absolute Paths Where Possible

When referencing project files, use absolute paths or paths relative to the script location.

**Good:**
```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config.sh"
```

**Bad:**
```bash
source ../config.sh  # May fail if called from different directory
```

### 3. Make Scripts Executable

Ensure all scripts are executable:

```bash
chmod +x scripts/*.sh
```

### 4. Test Scripts Before Committing

Test each script before committing:

```bash
# Test each script
bash scripts/ask.sh "Test"
bash scripts/forge.sh --help
bash scripts/finish.sh --help

# Test via package.json
bun run ask "Test"
bun run forge --help
bun run finish --help
```

### 5. Document Customizations

Document any customizations made to scripts in comments:

```bash
#!/bin/bash
# Customized for Project X
# Changes:
# - Added support for custom test runner
# - Modified notification format
```

### 6. Keep `AGENTS.md` Up to Date

Update `AGENTS.md` as the project evolves:

- Add new coding standards
- Update tech stack information
- Add new forbidden actions
- Remove outdated information

## Common Issues

### Issue 1: Scripts Not Executable

**Symptoms:**
```bash
bash scripts/forge.sh
# Permission denied
```

**Solution:**
```bash
chmod +x scripts/*.sh
```

### Issue 2: `NTFY_TOPIC` Not Configured

**Symptoms:**
```bash
bun run ask "Test"
# Error: NTFY_TOPIC not set
```

**Solution:**
Edit `scripts/ask.sh` and set the correct topic:

```bash
NTFY_TOPIC="your-project-topic"
```

### Issue 3: `verify` Script Fails

**Symptoms:**
```bash
bun run verify
# Tests fail
```

**Solution:**
1. Check that tests pass locally
2. Update `verify` script to match project's test suite
3. Ensure all dependencies are installed

### Issue 4: `td` Not Initialized

**Symptoms:**
```bash
td usage --new-session
# Error: td not initialized
```

**Solution:**
```bash
td init --name <repo-name>
```

### Issue 5: Directories Not Created

**Symptoms:**
```bash
bun run forge
# Error: briefs directory not found
```

**Solution:**
```bash
mkdir -p briefs debriefs playbooks tests/human
```

## References

- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Complete workflow documentation
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [AGENTS.md Template](../AGENTS.md) – Project constitution template

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team

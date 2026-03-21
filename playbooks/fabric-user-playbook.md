---
date: 2026-03-21
tags: [playbook, fabric, user, ai, patterns, cli, productivity, workflow]
agent: local-ai
environment: development
version: 1.0
last_updated: 2026-03-21
---

# Fabric User Playbook

## Purpose
Use `fabric` as your AI augmentation toolkit for everyday tasks. Fabric provides 250+ reusable AI patterns that can be piped into any workflow to summarize, analyze, extract, and transform content. This playbook provides comprehensive guidance for end-users to leverage fabric's capabilities effectively.

**Core Philosophy:** Patterns over prompts. Use pre-built patterns instead of crafting prompts from scratch. Pipe everything through Unix workflows via stdin/stdout. Stream for speed and create custom patterns for repeated tasks.

## Table of Contents

- [Purpose](#purpose)
- [Table of Contents](#table-of-contents)
- [Core Principles](#core-principles)
- [Quick Start (Checklist)](#quick-start-checklist)
- [Installation](#installation)
- [Configuration](#configuration)
- [Common Usage Patterns](#common-usage-patterns)
  - [Summarize Content](#summarize-content)
  - [Extract Information](#extract-information)
  - [Code Tasks](#code-tasks)
  - [Writing & Content Creation](#writing--content-creation)
  - [Analysis](#analysis)
  - [YouTube Content](#youtube-content)
- [Advanced Usage](#advanced-usage)
  - [Chain Patterns Together](#chain-patterns-together)
  - [Use Different Models](#use-different-models)
  - [Save & Reuse Context](#save--reuse-context)
  - [Output Options](#output-options)
- [Pattern Discovery](#pattern-discovery)
- [Creating Custom Patterns](#creating-custom-patterns)
- [Integration Examples](#integration-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Tips & Tricks](#tips--tricks)
- [References](#references)

## Core Principles

1. **Patterns over prompts**: Use pre-built patterns instead of crafting prompts from scratch.
2. **Pipe everything**: Fabric integrates into Unix workflows via stdin/stdout.
3. **Stream for speed**: Use `--stream` for real-time output.
4. **Custom patterns**: Create your own patterns for repeated tasks.

## Quick Start (Checklist)

1. Install fabric
2. Configure API keys
3. Update patterns
4. Test with a simple pattern
5. Explore available patterns

## Installation

### macOS/Linux (One-line installer)

```bash
curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/scripts/installer/install.sh | bash
```

### Verify Installation

```bash
fabric --version
```

## Configuration

### Initial Setup

```bash
# Run interactive setup wizard
fabric --setup

# Or manually edit config
nano ~/.config/fabric/.env
```

### Add API Keys

Edit `~/.config/fabric/.env`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GOOGLE_API_KEY=...

# Or use local models with Ollama (no API key needed)
```

### Update Patterns

```bash
fabric --updatepatterns
```

### List Available Resources

```bash
# List all patterns
fabric --listpatterns

# List available models
fabric --listmodels

# List saved contexts
fabric --listcontexts
```

## Common Usage Patterns

### Summarize Content

```bash
# Summarize a URL
fabric -u https://example.com/article -p summarize

# Summarize clipboard content (macOS)
pbpaste | fabric -p summarize

# Summarize a file
cat document.txt | fabric -p summarize

# Summarize with streaming
cat long-article.txt | fabric -sp summarize
```

**When to use:**
- Condensing long documents
- Getting quick overviews
- Processing meeting notes
- Summarizing research papers

### Extract Information

```bash
# Extract main ideas
cat article.txt | fabric -p extract_ideas

# Extract article wisdom
fabric -u https://blog.com/post -p extract_article_wisdom

# Extract action items from meeting notes
cat meeting-notes.txt | fabric -p extract_actions
```

**When to use:**
- Pulling key points from documents
- Extracting action items
- Identifying main themes
- Gathering insights

### Code Tasks

```bash
# Explain code
cat script.py | fabric -p explain_code

# Write pull request description
git diff main | fabric -p write_pull-request

# Analyze code for security
cat app.js | fabric -p analyze_malware

# Create coding instructions
cat requirements.txt | fabric -p create_coding_project
```

**When to use:**
- Understanding complex code
- Writing commit messages
- Security reviews
- Project planning

### Writing & Content Creation

```bash
# Write an essay
echo "Why AI augmentation matters" | fabric -p write_essay

# Create social media post
echo "Fabric CLI launch announcement" | fabric -p create_social_media_post

# Improve writing
cat draft.md | fabric -p improve_writing

# Write a micro-essay
echo "The future of AI tools" | fabric -p write_micro_essay
```

**When to use:**
- Drafting content
- Improving existing writing
- Creating social posts
- Generating essays

### Analysis

```bash
# Analyze claims
cat article.txt | fabric -p analyze_claims

# Analyze debate
fabric -u https://debate.com/transcript -p analyze_debate

# Rate content quality
cat content.md | fabric -p rate_content

# Label content
echo "AI article text" | fabric -p label
```

**When to use:**
- Fact-checking
- Content evaluation
- Quality assessment
- Categorization

### YouTube Content

```bash
# Summarize YouTube video
fabric -y https://youtube.com/watch?v=... -p summarize

# Extract wisdom from video
fabric -y https://youtube.com/watch?v=... -p extract_wisdom

# Get transcript only
fabric -y https://youtube.com/watch?v=... -p extract_video_ideas
```

**When to use:**
- Processing video content
- Extracting video insights
- Summarizing tutorials
- Analyzing presentations

## Advanced Usage

### Chain Patterns Together

```bash
# Extract ideas then summarize
cat article.txt | fabric -p extract_ideas | fabric -p summarize

# Analyze then improve
cat code.py | fabric -p analyze_code | fabric -p improve_report_finding
```

**Benefits:**
- Multi-stage processing
- Deeper analysis
- More nuanced output

### Use Different Models

```bash
# Use specific model
echo "test" | fabric -p summarize -m gpt-4

# Use Claude
echo "test" | fabric -p summarize -m claude-3-opus-20240229

# Use local Ollama model
echo "test" | fabric -p summarize -m llama2
```

**Model Selection Strategy:**

| Model Type | Use Case | Examples |
|------------|----------|----------|
| Fast models (gpt-3.5-turbo, claude-instant) | Simple summarization, quick analysis | `summarize`, `extract_ideas` |
| Powerful models (gpt-4, claude-opus) | Complex analysis, critical tasks | `analyze_code`, `analyze_claims` |
| Local models (ollama) | Privacy-sensitive work, offline | Any pattern with privacy concerns |

### Save & Reuse Context

```bash
# Save context for reuse
cat context.txt | fabric -p summarize -c my-context

# List contexts
fabric --listcontexts

# Use saved context
echo "Follow-up question" | fabric -p ai -C my-context
```

**Benefits:**
- Maintain context across operations
- Enable follow-up questions
- Reference previous analyses

### Output Options

```bash
# Copy to clipboard
cat file.txt | fabric -p summarize -c

# Save to file
cat input.txt | fabric -p summarize -o output.txt

# Stream output
cat large-file.txt | fabric -sp summarize
```

**Benefits:**
- Flexible output options
- Easy integration with other tools
- Real-time feedback for long operations

## Pattern Discovery

### Find the Right Pattern

```bash
# List all patterns
fabric --listpatterns | grep summary

# Search patterns by task
fabric --listpatterns | grep code
fabric --listpatterns | grep analyze
fabric --listpatterns | grep extract

# Get pattern suggestions (if available)
fabric -p suggest_pattern
```

### Popular Patterns

| Pattern | Purpose | Frequency |
|---------|---------|-----------|
| `summarize` | General summarization | Daily |
| `extract_wisdom` | Extract key insights | Weekly |
| `extract_ideas` | Pull out main ideas | Weekly |
| `analyze_claims` | Evaluate claims and arguments | Monthly |
| `explain_code` | Code explanation | Daily |
| `write_essay` | Essay writing | Weekly |
| `write_pull-request` | PR descriptions | Weekly |
| `improve_writing` | Writing enhancement | Weekly |
| `create_summary` | Create structured summaries | Weekly |
| `rate_content` | Content quality rating | Monthly |

## Creating Custom Patterns

### Pattern Structure

Custom patterns are markdown files in `~/.config/fabric/patterns/my-pattern/system.md`

```markdown
# IDENTITY
You are an expert at [specific task].

# GOAL
Your goal is to [specific outcome].

# STEPS
- Step 1: [instruction]
- Step 2: [instruction]
- Step 3: [instruction]

# OUTPUT FORMAT
- Format the output as [specific format]
- Include [specific elements]

# OUTPUT INSTRUCTIONS
- Only output the final result
- Do not include explanations unless asked
```

### Example: Custom Pattern

Create `~/.config/fabric/patterns/extract-todos/system.md`:

```markdown
# IDENTITY
You are a task extraction expert.

# GOAL
Extract all TODO items, action items, and tasks from the input text.

# STEPS
- Read the input carefully
- Identify all tasks, TODOs, and action items
- Extract them with context

# OUTPUT FORMAT
- [ ] Task description (priority, context if available)

# OUTPUT INSTRUCTIONS
- Only output the task list
- Include priority if mentioned
- Add brief context in parentheses
```

Use it:

```bash
cat notes.txt | fabric -p extract-todos
```

## Integration Examples

### Git Workflows

```bash
# Generate commit message from diff
git diff --staged | fabric -p create_git_commit_message

# Write PR description
git diff main..feature-branch | fabric -p write_pull-request

# Summarize recent commits
git log --oneline -10 | fabric -p summarize
```

**Benefits:**
- Consistent commit messages
- Better PR descriptions
- Automated changelog generation

### Note Taking

```bash
# Summarize meeting notes
cat meeting-notes.txt | fabric -p summarize | tee summary.txt

# Extract action items
cat notes.txt | fabric -p extract_actions >> actions.md
```

**Benefits:**
- Quick meeting summaries
- Action item extraction
- Better note organization

### Reading & Research

```bash
# Summarize article
fabric -u https://article-url.com -p extract_article_wisdom

# Compare multiple sources
(cat source1.txt; cat source2.txt) | fabric -p analyze_debate
```

**Benefits:**
- Quick article summaries
- Source comparison
- Research synthesis

### Code Review

```bash
# Review PR diff
gh pr diff 123 | fabric -p analyze_code

# Security analysis
cat app.py | fabric -p analyze_malware
```

**Benefits:**
- Automated code review
- Security vulnerability detection
- Actionable feedback

## Best Practices

### 1. Start Simple

Use built-in patterns before creating custom ones.

**Why:** Built-in patterns are tested and optimized.

```bash
# Good
cat article.txt | fabric -p summarize

# Bad (unless necessary)
echo "Summarize this article" | openai api
```

### 2. Stream Long Content

Use `-s` flag for real-time output on large inputs.

**Why:** Streaming provides real-time feedback and prevents memory issues.

```bash
# Good
cat large-file.txt | fabric -sp summarize

# Bad
cat large-file.txt | fabric -p summarize
```

### 3. Chain Strategically

Pipe patterns together for complex workflows.

**Why:** Chaining enables deeper analysis and more nuanced output.

```bash
# Good
cat article.txt | fabric -p extract_ideas | fabric -p summarize

# Bad (unrelated patterns)
cat article.txt | fabric -p analyze_code | fabric -p write_essay
```

### 4. Save Contexts

Reuse context for follow-up questions.

**Why:** Context preservation enables more sophisticated analysis.

```bash
# Good
cat codebase.md | fabric -p summarize -c project-context
echo "What about security?" | fabric -p ai -C project-context

# Bad (no context)
echo "What about security?" | fabric -p ai
```

### 5. Version Patterns

Keep custom patterns in version control.

**Why:** Version control ensures patterns are backed up and shareable.

```bash
# Add to git
git add ~/.config/fabric/patterns/
git commit -m "Add custom patterns"
```

### 6. Update Regularly

Run `fabric --updatepatterns` monthly.

**Why:** Regular updates ensure access to the latest patterns and improvements.

```bash
# Add to cron or schedule
fabric --updatepatterns
```

## Troubleshooting

### Common Issues

#### API Key Issues

**Symptoms:**
```bash
fabric -p summarize
# Error: API key not found
```

**Solution:**
```bash
# Check config
cat ~/.config/fabric/.env

# Verify models are available
fabric --listmodels

# Re-run setup
fabric --setup
```

#### Pattern Not Found

**Symptoms:**
```bash
fabric -p unknown-pattern
# Error: Pattern not found
```

**Solution:**
```bash
# Update patterns
fabric --updatepatterns

# Check pattern exists
fabric --listpatterns | grep pattern-name
```

#### Performance Issues

**Symptoms:**
```bash
cat large-file.txt | fabric -p summarize
# Slow or hangs
```

**Solution:**
```bash
# Use streaming for large inputs
cat large-file.txt | fabric -sp summarize

# Use faster models
echo "test" | fabric -p summarize -m gpt-3.5-turbo
```

## Tips & Tricks

### Aliases

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# Quick summarize
alias fsumm='fabric -p summarize'

# Quick extract wisdom
alias fwisdom='fabric -p extract_wisdom'

# Quick code explanation
alias fcode='fabric -p explain_code'

# Clipboard summarize
alias fclip='pbpaste | fabric -p summarize'
```

### Shell Functions

```bash
# Summarize URL
furl() {
  fabric -u "$1" -p summarize
}

# Summarize and copy to clipboard
fsummc() {
  fabric -p summarize -c
}
```

### Keyboard Shortcuts (macOS)

Create Automator workflows for common tasks:

1. Open Automator
2. Create new "Quick Action"
3. Add "Run Shell Script"
4. Add your fabric command
5. Save and assign keyboard shortcut

## References

- [Fabric Documentation](https://github.com/danielmiessler/fabric) – Official fabric documentation
- [Pattern Library](https://github.com/danielmiessler/fabric/tree/main/patterns) – Available patterns
- [Config Location](~/.config/fabric/) – Configuration directory
- [Patterns Location](~/.config/fabric/patterns/) – Custom patterns directory
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Fabric Agent Playbook](./fabric-agent-playbook.md) – Agent-specific fabric usage

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team

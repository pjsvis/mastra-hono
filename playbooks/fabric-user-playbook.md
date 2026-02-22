---
name: fabric-user
description: End-user playbook for using the fabric CLI to augment work with AI patterns.
---

# Fabric User Playbook

## Purpose
Use `fabric` as your AI augmentation toolkit for everyday tasks. Fabric provides 250+ reusable AI patterns that can be piped into any workflow to summarize, analyze, extract, and transform content.

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

---

## Installation

### macOS/Linux (One-line installer)
```bash
curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/scripts/installer/install.sh | bash
```

### Verify Installation
```bash
fabric --version
```

---

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

---

## Common Usage Patterns

### 1) Summarize Content
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

### 2) Extract Information
```bash
# Extract main ideas
cat article.txt | fabric -p extract_ideas

# Extract article wisdom
fabric -u https://blog.com/post -p extract_article_wisdom

# Extract action items from meeting notes
cat meeting-notes.txt | fabric -p extract_actions
```

### 3) Code Tasks
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

### 4) Writing & Content Creation
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

### 5) Analysis
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

### 6) YouTube Content
```bash
# Summarize YouTube video
fabric -y https://youtube.com/watch?v=... -p summarize

# Extract wisdom from video
fabric -y https://youtube.com/watch?v=... -p extract_wisdom

# Get transcript only
fabric -y https://youtube.com/watch?v=... -p extract_video_ideas
```

---

## Advanced Usage

### Chain Patterns Together
```bash
# Extract ideas then summarize
cat article.txt | fabric -p extract_ideas | fabric -p summarize

# Analyze then improve
cat code.py | fabric -p analyze_code | fabric -p improve_report_finding
```

### Use Different Models
```bash
# Use specific model
echo "test" | fabric -p summarize -m gpt-4

# Use Claude
echo "test" | fabric -p summarize -m claude-3-opus-20240229

# Use local Ollama model
echo "test" | fabric -p summarize -m llama2
```

### Save & Reuse Context
```bash
# Save context for reuse
cat context.txt | fabric -p summarize -c my-context

# List contexts
fabric --listcontexts

# Use saved context
echo "Follow-up question" | fabric -p ai -C my-context
```

### Output Options
```bash
# Copy to clipboard
cat file.txt | fabric -p summarize -c

# Save to file
cat input.txt | fabric -p summarize -o output.txt

# Stream output
cat large-file.txt | fabric -sp summarize
```

---

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
- **summarize**: General summarization
- **extract_wisdom**: Extract key insights
- **extract_ideas**: Pull out main ideas
- **analyze_claims**: Evaluate claims and arguments
- **explain_code**: Code explanation
- **write_essay**: Essay writing
- **write_pull-request**: PR descriptions
- **improve_writing**: Writing enhancement
- **create_summary**: Create structured summaries
- **rate_content**: Content quality rating

---

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

---

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

### Note Taking
```bash
# Summarize meeting notes
cat meeting-notes.txt | fabric -p summarize | tee summary.txt

# Extract action items
cat notes.txt | fabric -p extract_actions >> actions.md
```

### Reading & Research
```bash
# Summarize article
fabric -u https://article-url.com -p extract_article_wisdom

# Compare multiple sources
(cat source1.txt; cat source2.txt) | fabric -p analyze_debate
```

### Code Review
```bash
# Review PR diff
gh pr diff 123 | fabric -p analyze_code

# Security analysis
cat app.py | fabric -p analyze_malware
```

---

## Best Practices

1. **Start simple**: Use built-in patterns before creating custom ones.
2. **Stream long content**: Use `-s` flag for real-time output on large inputs.
3. **Chain strategically**: Pipe patterns together for complex workflows.
4. **Save contexts**: Reuse context for follow-up questions.
5. **Version patterns**: Keep custom patterns in version control.
6. **Update regularly**: Run `fabric --updatepatterns` monthly.

---

## Troubleshooting

### Common Issues

**API Key Issues**
```bash
# Check config
cat ~/.config/fabric/.env

# Verify models are available
fabric --listmodels
```

**Pattern Not Found**
```bash
# Update patterns
fabric --updatepatterns

# Check pattern exists
fabric --listpatterns | grep pattern-name
```

**Performance Issues**
```bash
# Use streaming for large inputs
cat large-file.txt | fabric -sp summarize

# Use faster models
echo "test" | fabric -p summarize -m gpt-3.5-turbo
```

---

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

---

## Resources

- **Documentation**: https://github.com/danielmiessler/fabric
- **Pattern Library**: https://github.com/danielmiessler/fabric/tree/main/patterns
- **Config Location**: `~/.config/fabric/`
- **Patterns Location**: `~/.config/fabric/patterns/`

---

## Summary

Fabric turns AI into a Unix tool. Pipe content in, get AI-processed results out. Use it for summaries, extraction, analysis, writing, and more. Start with built-in patterns, create custom ones as needed, and integrate into your daily workflows.

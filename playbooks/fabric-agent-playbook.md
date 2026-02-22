---
name: fabric-agent
description: AI agent playbook for using fabric CLI to augment code review, analysis, and content generation tasks.
---

# Fabric Agent Playbook

## Purpose
This playbook defines how AI agents should use the `fabric` CLI to enhance their capabilities with pre-built AI patterns for code analysis, content summarization, documentation generation, and more.

## Core Principles
1. **Leverage patterns**: Use fabric patterns instead of crafting similar prompts from scratch.
2. **Compose workflows**: Chain fabric patterns with other tools for complex tasks.
3. **Stream large inputs**: Always use `--stream` for outputs >1KB.
4. **Document with patterns**: Generate documentation, PR descriptions, and summaries systematically.

## Mandatory Directives

### 1) Use Fabric for Repetitive AI Tasks
Before writing a custom prompt for common tasks, check if a fabric pattern exists:
```bash
fabric --listpatterns | grep <task-keyword>
```

### 2) Always Stream Large Content
When processing files >1KB or long API responses:
```bash
cat large-file.txt | fabric -sp <pattern-name>
```

### 3) Generate Documentation Systematically
Use fabric patterns for consistent documentation:
```bash
# Explain code
cat module.py | fabric -p explain_code

# Generate PR description
git diff main | fabric -p write_pull-request

# Create API documentation
cat api.py | fabric -p create_api_documentation
```

---

## Standard Workflows

### A) Code Review & Analysis
```bash
# Analyze code quality
cat src/app.js | fabric -p analyze_code

# Security analysis
cat auth.py | fabric -p analyze_malware

# Extract key concepts from code
cat complex-module.ts | fabric -p extract_ideas

# Review PR diff
gh pr diff 123 | fabric -p analyze_code
```

### B) Documentation Generation
```bash
# Generate comprehensive docs
cat module.py | fabric -p explain_code > docs/module.md

# Write PR description
git diff main..feature-branch | fabric -p write_pull-request > pr-description.md

# Create README sections
echo "Project overview" | fabric -p improve_writing

# Generate API documentation
cat api-routes.ts | fabric -p create_api_documentation
```

### C) Content Summarization
```bash
# Summarize requirements
cat requirements.md | fabric -p summarize > summary.txt

# Extract key decisions
cat meeting-notes.txt | fabric -p extract_ideas

# Summarize research
fabric -u https://paper-url.com -p extract_article_wisdom

# Condense logs
cat debug.log | fabric -p summarize
```

### D) Writing Enhancement
```bash
# Improve technical writing
cat draft-docs.md | fabric -p improve_writing

# Generate commit messages
git diff --staged | fabric -p create_git_commit_message

# Create essays/blog posts
echo "Topic: AI in software development" | fabric -p write_essay

# Generate social content
echo "Feature announcement: New API" | fabric -p create_social_media_post
```

---

## Integration Patterns

### With Git Workflows
```bash
# Pre-commit: Generate commit message
git diff --staged | fabric -p create_git_commit_message

# PR creation: Generate description
git diff main | fabric -p write_pull-request > pr-template.md

# Post-merge: Summarize changes
git log --oneline -10 | fabric -p summarize > changelog.md
```

### With Code Review
```bash
# Review submitted code
gh pr diff <pr-number> | fabric -p analyze_code

# Check for security issues
cat new-feature.py | fabric -p analyze_malware

# Extract review comments
cat review-notes.txt | fabric -p extract_actions
```

### With Documentation
```bash
# Auto-document functions
cat utils.ts | fabric -p explain_code >> docs/utils.md

# Create user guides
cat feature-spec.md | fabric -p create_user_guide

# Generate API docs
cat api.py | fabric -p create_api_documentation > api-docs.md
```

### With Testing
```bash
# Analyze test coverage gaps
cat test-report.txt | fabric -p analyze_incident

# Extract test requirements
cat requirements.md | fabric -p extract_actions > test-checklist.md

# Review test results
cat test-output.txt | fabric -p summarize
```

---

## Pattern Selection Guide

### When to Use Which Pattern

**Code-Related:**
- `explain_code`: Explain complex code sections
- `analyze_code`: Review code quality and structure
- `analyze_malware`: Security and vulnerability analysis
- `improve_code`: Code improvement suggestions
- `create_coding_project`: Project structure planning

**Documentation:**
- `write_pull-request`: PR descriptions
- `create_git_commit_message`: Commit messages
- `improve_writing`: Enhance existing docs
- `create_api_documentation`: API reference
- `explain_terms`: Technical terminology

**Analysis:**
- `summarize`: General summarization
- `extract_ideas`: Key concepts extraction
- `extract_wisdom`: Insights and takeaways
- `analyze_claims`: Evaluate assertions
- `rate_content`: Quality assessment

**Content Creation:**
- `write_essay`: Long-form content
- `write_micro_essay`: Short-form content
- `create_social_media_post`: Social content
- `create_summary`: Structured summaries
- `improve_report_finding`: Report enhancement

---

## Advanced Usage

### Chaining Patterns
```bash
# Extract then summarize
cat long-article.md | fabric -p extract_ideas | fabric -p summarize

# Analyze then improve
cat code.py | fabric -p analyze_code | fabric -p improve_report_finding

# Multiple analysis stages
cat requirements.txt | \
  fabric -p extract_ideas | \
  fabric -p create_coding_project
```

### Context Management
```bash
# Save context for multi-turn analysis
cat codebase-overview.md | fabric -p summarize -c project-context

# Reuse context for follow-up
echo "What are the security implications?" | fabric -p ai -C project-context

# List saved contexts
fabric --listcontexts
```

### Model Selection
```bash
# Use faster models for simple tasks
cat simple-code.py | fabric -p summarize -m gpt-3.5-turbo

# Use powerful models for complex analysis
cat complex-system.ts | fabric -p analyze_code -m claude-3-opus-20240229

# Use local models for privacy
cat sensitive-code.py | fabric -p analyze_code -m llama2
```

### Output Management
```bash
# Save to file
cat module.ts | fabric -p explain_code -o docs/module.md

# Copy to clipboard for pasting
git diff main | fabric -p write_pull-request -c

# Stream for real-time feedback
cat large-log.txt | fabric -sp summarize
```

---

## Agent-Specific Patterns

### 1) Code Analysis Flow
```bash
# Step 1: Analyze code structure
cat src/**/*.ts | fabric -p analyze_code > analysis.md

# Step 2: Extract security concerns
cat src/**/*.ts | fabric -p analyze_malware > security.md

# Step 3: Summarize findings
cat analysis.md security.md | fabric -p summarize > report.md
```

### 2) Documentation Generation Flow
```bash
# Step 1: Explain core modules
for file in src/*.py; do
  cat "$file" | fabric -p explain_code >> docs/modules.md
done

# Step 2: Create overview
cat docs/modules.md | fabric -p summarize > docs/overview.md

# Step 3: Generate README sections
cat docs/overview.md | fabric -p improve_writing > README.md
```

### 3) PR Review Flow
```bash
# Step 1: Get PR diff
gh pr diff <pr-number> > pr-diff.txt

# Step 2: Analyze changes
cat pr-diff.txt | fabric -p analyze_code > review-analysis.md

# Step 3: Generate review comments
cat review-analysis.md | fabric -p extract_actions > review-comments.md

# Step 4: Create PR comment
cat review-comments.md | fabric -p improve_writing
```

---

## Do / Don't

### Do
- Check for existing patterns before writing custom prompts
- Use `--stream` for large inputs
- Chain patterns for complex workflows
- Save context for multi-turn analysis
- Document which patterns you use in comments
- Update patterns regularly with `fabric --updatepatterns`

### Don't
- Don't write custom prompts for tasks that have patterns
- Don't process large files without streaming
- Don't ignore pattern suggestions from `suggest_pattern`
- Don't mix unrelated patterns in a chain
- Don't forget to specify model when quality matters
- Don't use patterns for tasks requiring code execution

---

## Pattern Library Reference

### Most Useful for Agents

**Essential:**
- `summarize`: Universal summarization
- `explain_code`: Code explanation
- `analyze_code`: Code review
- `write_pull-request`: PR descriptions
- `extract_ideas`: Concept extraction

**Frequently Used:**
- `improve_writing`: Documentation enhancement
- `create_git_commit_message`: Commit messages
- `analyze_malware`: Security analysis
- `extract_wisdom`: Insights extraction
- `rate_content`: Quality assessment

**Specialized:**
- `create_coding_project`: Project planning
- `create_api_documentation`: API docs
- `analyze_claims`: Argument analysis
- `extract_actions`: Task extraction
- `improve_report_finding`: Report enhancement

---

## Performance Considerations

### When to Stream
```bash
# Always stream for:
# - Files >1KB
# - Multiple file analysis
# - Long documents
# - Real-time feedback needs

cat large-file.txt | fabric -sp summarize
```

### Model Selection Strategy
```bash
# Fast models (gpt-3.5-turbo, claude-instant):
# - Simple summarization
# - Quick code explanations
# - Draft generation

# Powerful models (gpt-4, claude-opus):
# - Complex code analysis
# - Security reviews
# - Critical documentation

# Local models (ollama):
# - Sensitive code
# - Offline work
# - High-volume tasks
```

---

## Integration with Other Tools

### With td (Task Management)
```bash
# Generate task description from requirements
cat requirements.md | fabric -p extract_ideas | td create --type feature

# Summarize task progress
td context <issue-id> | fabric -p summarize

# Generate handoff notes
git diff | fabric -p summarize > handoff.md
```

### With GitHub CLI
```bash
# Review PR
gh pr view <pr-number> --json body | jq -r .body | fabric -p analyze_claims

# Generate release notes
gh pr list --state merged --json title,body | \
  jq -r '.[] | .title' | \
  fabric -p summarize
```

### With Testing Tools
```bash
# Analyze test failures
npm test 2>&1 | fabric -p analyze_incident

# Generate test documentation
cat test/*.spec.ts | fabric -p explain_code > docs/tests.md
```

---

## Custom Pattern Creation for Agents

When creating custom patterns for agent-specific workflows:

### Pattern Template
```markdown
# IDENTITY
You are a [specific role] expert specializing in [domain].

# GOAL
[Clear, specific objective]

# STEPS
1. [Concrete action]
2. [Concrete action]
3. [Concrete action]

# OUTPUT FORMAT
[Specific format with examples]

# OUTPUT INSTRUCTIONS
- Be specific and actionable
- Include context when relevant
- Use consistent formatting
- No explanations unless requested
```

### Example: PR Review Pattern
Create `~/.config/fabric/patterns/agent-pr-review/system.md`:

```markdown
# IDENTITY
You are a senior code reviewer with expertise in software architecture and best practices.

# GOAL
Review code changes and provide actionable feedback focused on correctness, performance, and maintainability.

# STEPS
1. Analyze the diff for logical errors
2. Check for performance implications
3. Evaluate code maintainability
4. Identify security concerns
5. Suggest improvements

# OUTPUT FORMAT
## Summary
[Brief overview of changes]

## Issues Found
- [Issue 1]: [Description] (Priority: High/Medium/Low)
- [Issue 2]: [Description]

## Suggestions
- [Suggestion 1]: [Specific improvement]
- [Suggestion 2]: [Specific improvement]

## Approval Status
[Approve/Needs Changes/Reject]

# OUTPUT INSTRUCTIONS
- Be specific with line numbers when possible
- Prioritize issues by impact
- Suggest concrete improvements
- Keep feedback constructive
```

---

## Troubleshooting

### Pattern Not Working as Expected
```bash
# Check pattern exists
fabric --listpatterns | grep pattern-name

# Update patterns
fabric --updatepatterns

# Try with explicit model
fabric -p pattern-name -m gpt-4
```

### Performance Issues
```bash
# Use streaming
fabric -sp pattern-name

# Use faster model
fabric -p pattern-name -m gpt-3.5-turbo

# Split large inputs
split -l 1000 large-file.txt chunk-
for chunk in chunk-*; do
  cat "$chunk" | fabric -p summarize >> output.txt
done
```

---

## Summary

Fabric provides AI agents with 250+ pre-built patterns for common tasks. Use it for code analysis, documentation generation, content summarization, and workflow automation. Integrate with git, testing tools, and task management. Stream large inputs, chain patterns for complex workflows, and create custom patterns for specialized agent tasks.

## Quick Reference

```bash
# Setup
fabric --setup
fabric --updatepatterns

# Common patterns
fabric -p summarize
fabric -p explain_code
fabric -p analyze_code
fabric -p write_pull-request

# Streaming
fabric -sp <pattern>

# Model selection
fabric -p <pattern> -m <model>

# Context management
fabric -p <pattern> -c <context-name>
fabric -p <pattern> -C <context-name>

# Output
fabric -p <pattern> -o <file>
fabric -p <pattern> -c  # clipboard
```

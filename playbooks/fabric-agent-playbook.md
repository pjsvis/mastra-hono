---
id: PB-009
title: "Fabric Agent Playbook"
role: "Build"
infrastructure: [fabric]
last_updated: "2026-03-21"
tags: [playbook]
---

# Fabric Agent Playbook

## Purpose
This playbook defines how AI agents should use the `fabric` CLI to enhance their capabilities with pre-built AI patterns for code analysis, content summarization, documentation generation, and more. It provides comprehensive guidelines for leveraging fabric's 250+ patterns to improve agent efficiency and output quality.

**Core Philosophy:** Leverage existing fabric patterns instead of crafting similar prompts from scratch. Compose patterns with other tools for complex tasks, and always stream large inputs for better performance.


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

**Why:** Fabric provides 250+ pre-built patterns optimized for common tasks. Using them saves time and ensures consistent, high-quality output.

### 2) Always Stream Large Content

When processing files >1KB or long API responses:

```bash
cat large-file.txt | fabric -sp <pattern-name>
```

**Why:** Streaming provides real-time feedback and prevents memory issues with large inputs. Use `-sp` flag for streaming.

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

**Why:** Consistent documentation improves maintainability and reduces onboarding time for new developers.

## Standard Workflows

### Code Review & Analysis

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

**When to use:**
- Before committing code
- During code reviews
- When analyzing security vulnerabilities
- When documenting complex code

### Documentation Generation

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

**When to use:**
- When creating new documentation
- When updating existing docs
- When generating PR descriptions
- When creating API references

### Content Summarization

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

**When to use:**
- When reviewing large documents
- When extracting key information
- When condensing logs or output
- When summarizing research papers

### Writing Enhancement

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

**When to use:**
- When improving existing documentation
- When generating commit messages
- When creating marketing content
- When writing blog posts or essays

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

**Benefits:**
- Consistent commit messages
- Better PR descriptions
- Automated changelog generation

### With Code Review

```bash
# Review submitted code
gh pr diff <pr-number> | fabric -p analyze_code

# Check for security issues
cat new-feature.py | fabric -p analyze_malware

# Extract review comments
cat review-notes.txt | fabric -p extract_actions
```

**Benefits:**
- Automated code review
- Security vulnerability detection
- Actionable review comments

### With Documentation

```bash
# Auto-document functions
cat utils.ts | fabric -p explain_code >> docs/utils.md

# Create user guides
cat feature-spec.md | fabric -p create_user_guide

# Generate API docs
cat api.py | fabric -p create_api_documentation > api-docs.md
```

**Benefits:**
- Automated documentation generation
- Consistent documentation style
- Up-to-date API references

### With Testing

```bash
# Analyze test coverage gaps
cat test-report.txt | fabric -p analyze_incident

# Extract test requirements
cat requirements.md | fabric -p extract_actions > test-checklist.md

# Review test results
cat test-output.txt | fabric -p summarize
```

**Benefits:**
- Test coverage analysis
- Automated test plan generation
- Test result summarization

## Pattern Selection Guide

### When to Use Which Pattern

**Code-Related:**

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| `explain_code` | Explain complex code sections | When documenting or reviewing code |
| `analyze_code` | Review code quality and structure | During code review |
| `analyze_malware` | Security and vulnerability analysis | When checking for security issues |
| `improve_code` | Code improvement suggestions | When refactoring or optimizing |
| `create_coding_project` | Project structure planning | When starting new projects |

**Documentation:**

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| `write_pull-request` | PR descriptions | When creating PRs |
| `create_git_commit_message` | Commit messages | Before committing |
| `improve_writing` | Enhance existing docs | When updating documentation |
| `create_api_documentation` | API reference | When documenting APIs |
| `explain_terms` | Technical terminology | When defining terms |

**Analysis:**

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| `summarize` | General summarization | When condensing content |
| `extract_ideas` | Key concepts extraction | When analyzing documents |
| `extract_wisdom` | Insights and takeaways | When reviewing research |
| `analyze_claims` | Evaluate assertions | When fact-checking |
| `rate_content` | Quality assessment | When evaluating content |

**Content Creation:**

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| `write_essay` | Long-form content | When writing articles |
| `write_micro_essay` | Short-form content | When writing summaries |
| `create_social_media_post` | Social content | When creating social posts |
| `create_summary` | Structured summaries | When summarizing content |
| `improve_report_finding` | Report enhancement | When improving reports |

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

**Benefits:**
- Complex multi-stage workflows
- Deeper analysis through pattern composition
- More nuanced output

### Context Management

```bash
# Save context for multi-turn analysis
cat codebase-overview.md | fabric -p summarize -c project-context

# Reuse context for follow-up
echo "What are the security implications?" | fabric -p ai -C project-context

# List saved contexts
fabric --listcontexts
```

**Benefits:**
- Maintain context across multiple operations
- Enable follow-up questions
- Reference previous analyses

### Model Selection

```bash
# Use faster models for simple tasks
cat simple-code.py | fabric -p summarize -m gpt-3.5-turbo

# Use powerful models for complex analysis
cat complex-system.ts | fabric -p analyze_code -m claude-3-opus-20240229

# Use local models for privacy
cat sensitive-code.py | fabric -p analyze_code -m llama2
```

**Model Selection Strategy:**

| Model Type | Use Case | Examples |
|------------|----------|----------|
| Fast models (gpt-3.5-turbo, claude-instant) | Simple summarization, quick code explanations, draft generation | `summarize`, `explain_code` |
| Powerful models (gpt-4, claude-opus) | Complex code analysis, security reviews, critical documentation | `analyze_code`, `analyze_malware` |
| Local models (ollama) | Sensitive code, offline work, high-volume tasks | Any pattern with privacy concerns |

### Output Management

```bash
# Save to file
cat module.ts | fabric -p explain_code -o docs/module.md

# Copy to clipboard for pasting
git diff main | fabric -p write_pull-request -c

# Stream for real-time feedback
cat large-log.txt | fabric -sp summarize
```

**Benefits:**
- Flexible output options
- Easy integration with other tools
- Real-time feedback for long operations

## Agent-Specific Patterns

### Code Analysis Flow

```bash
# Step 1: Analyze code structure
cat src/**/*.ts | fabric -p analyze_code > analysis.md

# Step 2: Extract security concerns
cat src/**/*.ts | fabric -p analyze_malware > security.md

# Step 3: Summarize findings
cat analysis.md security.md | fabric -p summarize > report.md
```

**When to use:**
- Before major code changes
- During security audits
- When documenting code architecture

### Documentation Generation Flow

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

**When to use:**
- When creating new documentation
- When updating existing docs
- When onboarding new developers

### PR Review Flow

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

**When to use:**
- During code review
- When providing feedback on PRs
- When documenting review decisions

## Do / Don't

### Do

✅ Check for existing patterns before writing custom prompts
✅ Use `--stream` for large inputs
✅ Chain patterns for complex workflows
✅ Save context for multi-turn analysis
✅ Document which patterns you use in comments
✅ Update patterns regularly with `fabric --updatepatterns`

### Don't

❌ Don't write custom prompts for tasks that have patterns
❌ Don't process large files without streaming
❌ Don't ignore pattern suggestions from `suggest_pattern`
❌ Don't mix unrelated patterns in a chain
❌ Don't forget to specify model when quality matters
❌ Don't use patterns for tasks requiring code execution

## Pattern Library Reference

### Most Useful for Agents

**Essential:**

| Pattern | Purpose | Frequency |
|---------|---------|-----------|
| `summarize` | Universal summarization | Daily |
| `explain_code` | Code explanation | Daily |
| `analyze_code` | Code review | Daily |
| `write_pull-request` | PR descriptions | Weekly |
| `extract_ideas` | Concept extraction | Weekly |

**Frequently Used:**

| Pattern | Purpose | Frequency |
|---------|---------|-----------|
| `improve_writing` | Documentation enhancement | Weekly |
| `create_git_commit_message` | Commit messages | Daily |
| `analyze_malware` | Security analysis | Monthly |
| `extract_wisdom` | Insights extraction | Weekly |
| `rate_content` | Quality assessment | Monthly |

**Specialized:**

| Pattern | Purpose | Frequency |
|---------|---------|-----------|
| `create_coding_project` | Project planning | Monthly |
| `create_api_documentation` | API docs | Monthly |
| `analyze_claims` | Argument analysis | Monthly |
| `extract_actions` | Task extraction | Weekly |
| `improve_report_finding` | Report enhancement | Monthly |

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

**Why:** Streaming provides real-time feedback and prevents memory issues with large inputs.

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

**Guidelines:**
- Use fast models for simple, repetitive tasks
- Use powerful models for complex, critical analysis
- Use local models for privacy-sensitive work

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

**Benefits:**
- Automated task creation
- Better task documentation
- Improved handoff quality

### With GitHub CLI

```bash
# Review PR
gh pr view <pr-number> --json body | jq -r .body | fabric -p analyze_claims

# Generate release notes
gh pr list --state merged --json title,body | \
  jq -r '.[] | .title' | \
  fabric -p summarize
```

**Benefits:**
- Automated PR review
- Release note generation
- Issue analysis

### With Testing Tools

```bash
# Analyze test failures
npm test 2>&1 | fabric -p analyze_incident

# Generate test documentation
cat test/*.spec.ts | fabric -p explain_code > docs/tests.md
```

**Benefits:**
- Test failure analysis
- Automated test documentation
- Test coverage insights

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

**Common issues:**
- Pattern name typo
- Outdated pattern library
- Model compatibility issues

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

**Common issues:**
- Large input files
- Slow model selection
- Memory constraints

## Best Practices

### 1. Always Check for Existing Patterns

Before writing a custom prompt, search for existing patterns:

```bash
fabric --listpatterns | grep <keyword>
```

**Why:** Reusing existing patterns saves time and ensures consistency.

### 2. Stream Large Inputs

Always use streaming for files >1KB:

```bash
cat large-file.txt | fabric -sp summarize
```

**Why:** Streaming provides real-time feedback and prevents memory issues.

### 3. Chain Patterns for Complex Workflows

Combine patterns for multi-stage analysis:

```bash
cat code.py | fabric -p analyze_code | fabric -p summarize
```

**Why:** Chaining enables deeper analysis and more nuanced output.

### 4. Save Context for Multi-Turn Analysis

Use context management for follow-up questions:

```bash
cat codebase.md | fabric -p summarize -c project-context
echo "What about security?" | fabric -p ai -C project-context
```

**Why:** Context preservation enables more sophisticated analysis.

### 5. Document Pattern Usage

Add comments to code documenting which patterns were used:

```typescript
// Documentation generated with: fabric -p explain_code
/**
 * Function description...
 */
```

**Why:** Documentation helps future developers understand the workflow.

### 6. Update Patterns Regularly

Keep patterns up to date:

```bash
fabric --updatepatterns
```

**Why:** Regular updates ensure access to the latest patterns and improvements.

## Common Pitfalls

### Pitfall 1: Writing Custom Prompts for Common Tasks

**Problem:** Reinventing the wheel by writing custom prompts for tasks that have existing patterns.

**Solution:** Always check for existing patterns first.

```bash
# Bad
echo "Summarize this code" | openai api

# Good
cat code.py | fabric -p summarize
```

### Pitfall 2: Not Streaming Large Inputs

**Problem:** Processing large files without streaming causes memory issues and delays.

**Solution:** Always use streaming for large inputs.

```bash
# Bad
cat large-file.txt | fabric -p summarize

# Good
cat large-file.txt | fabric -sp summarize
```

### Pitfall 3: Mixing Unrelated Patterns

**Problem:** Chaining unrelated patterns produces confusing output.

**Solution:** Only chain patterns that logically flow together.

```bash
# Bad
cat code.py | fabric -p analyze_code | fabric -p write_essay

# Good
cat code.py | fabric -p analyze_code | fabric -p summarize
```

### Pitfall 4: Forgetting Model Selection

**Problem:** Using default models for tasks that require specific capabilities.

**Solution:** Specify the appropriate model for the task.

```bash
# Bad
cat complex-code.ts | fabric -p analyze_code

# Good
cat complex-code.ts | fabric -p analyze_code -m claude-3-opus-20240229
```

### Pitfall 5: Using Patterns for Code Execution

**Problem:** Attempting to use fabric patterns for tasks requiring actual code execution.

**Solution:** Use fabric for analysis and documentation, not execution.

```bash
# Bad
echo "Run this code" | fabric -p execute_code

# Good
bun run script.ts
cat output.txt | fabric -p analyze_code
```

## References

- [Fabric Documentation](https://github.com/danielmiessler/fabric) – Official fabric documentation
- [Pattern Library](https://github.com/danielmiessler/fabric/tree/main/patterns) – Available patterns
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Agentic SDLC Playbook](./agentic-sdlc.md) – Agent-assisted development practices
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team

---
id: PB-ctx-01
title: "ctx CLI Implementation Pattern"
role: "Build"
infrastructure: [bun]
last_updated: "2026-03-29"
tags: [playbook, cli, llm, fabric]
---

# ctx CLI Implementation Pattern

## Purpose
This playbook documents the Lean-Yggdrasil ctx CLI - a "Sleeve" for terminal-to-LLM weaponization using local-first patterns. It provides a reusable pattern for building self-contained CLI tools that bridge shell operations with AI capabilities.

**Core Philosophy:** Minimal dependencies, raw fetch() for LLM calls, local-first pattern storage, and tight integration with task management (td).

## Architecture

| Component | Substrate | Location |
|-----------|-----------|----------|
| `ctx` wrapper | Bash | `scripts/lab/ctx/ctx` |
| `ctx-logic.ts` | Bun | `scripts/lab/ctx/ctx-logic.ts` |
| `ops-lexicon.toml` | TOML | `scripts/lab/ctx/ops-lexicon.toml` |
| `./patterns/` | Markdown | `patterns/<name>/system.md` |

## Core Features

### 1. Status Reporting (`ctx wake`)
- Displays operational status from lexicon
- Shows available patterns
- Integrates with td task context
- Sub-100ms response time

### 2. History Weaponization (`ctx weaponize [n]`)
- Retrieves nth shell history entry
- Applies Fabric-style pattern
- Calls LLM with context injection
- Stores result in ops-lexicon.toml

### 3. Pattern System (`ctx patterns`)
- Loads from `./patterns/<name>/system.md`
- Repo-local (not ~/.config/fabric)
- TOML storage for operations

## Implementation Template

### ctx-logic.ts Structure

```typescript
#!/usr/bin/env bun
/**
 * ctx-logic.ts - Core LLM logic
 */

// --- Configuration ---
const CTX_DIR = resolve(process.cwd(), '.ctx');
const LEXICON_PATH = join(CTX_DIR, 'ops-lexicon.toml');
const PATTERNS_DIR = resolve(process.cwd(), 'patterns');

// --- TOML Persistence ---
function parseTOML(content: string): Record<string, unknown> {
  // Simple TOML parser
}

function serializeTOML(obj: Record<string, unknown>): string {
  // Simple TOML serializer
}

function loadLexicon() { /* ... */ }
function saveLexicon(lexicon) { /* ... */ }

// --- Pattern Loading ---
function loadPattern(name: string): string | null {
  const path = join(PATTERNS_DIR, name, 'system.md');
  return existsSync(path) ? readFileSync(path, 'utf-8') : null;
}

// --- LLM Communication ---
async function callLLM(prompt: string, system?: string): Promise<string> {
  // Raw fetch(), no LangChain
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.CTX_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 4096,
      system: system || 'You are helpful.',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}

// --- Commands ---
export async function cmdWake() { /* ... */ }
export async function cmdWeaponize(n: number, pattern?: string) { /* ... */ }
export async function cmdPatterns() { /* ... */ }

// --- Main ---
parseArgs({ /* ... */ });
```

### ctx Wrapper Script

```bash
#!/usr/bin/env bash
set -e
SCRIPT_DIR="${0%/*}"
exec bun "$SCRIPT_DIR/ctx-logic.ts" "$@"
```

### ops-lexicon.toml

```toml
# Lean-Yggdrasil: Operational Lexicon
version = "1.0"

[operations]
# Auto-populated by ctx-logic.ts
```

### Pattern Structure

```markdown
# Pattern Name
# One-line description

You are an expert at [domain].

## INPUT
[What the pattern receives]

## OUTPUT FORMAT
[Structured output template]

## PROCESS
1. Step one
2. Step two
```

## Directives

1. **No Monoliths**: Use raw `fetch()`, never LangChain/LlamaIndex
2. **Local Patterns**: Read from `./patterns/<name>/system.md`
3. **Context Injection**: Auto-include td task ID in LLM calls
4. **TOML Persistence**: Use TOML for lexicon storage (survives pipes/redirection)
5. **Fast Response**: `ctx ?` must return in < 100ms

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CTX_MODEL` | `claude-3-5-haiku-latest` | LLM model |
| `CTX_PROVIDER` | `anthropic` | API provider |
| `ANTHROPIC_API_KEY` | - | API key |

## Testing Pattern

```typescript
import { describe, expect, test } from 'bun:test';
import { existsSync } from 'fs';

describe('ctx CLI', () => {
  test('ctx-logic.ts exists', () => {
    expect(existsSync('scripts/lab/ctx/ctx-logic.ts')).toBe(true);
  });

  test('ctx wake executes', async () => {
    const proc = Bun.spawn({
      cmd: ['bun', 'scripts/lab/ctx/ctx-logic.ts', 'wake'],
    });
    const result = await new Response(proc.stdout).text();
    expect(result).toContain('CTX STATUS WAKING');
  });
});
```

## Deployment

Deployable via 3 components:
1. `scripts/lab/ctx/ctx` (wrapper)
2. `scripts/lab/ctx/ctx-logic.ts` (logic)
3. `patterns/` folder (any number of patterns)

## Success Criteria

- [ ] `ctx ?` returns in < 100ms
- [ ] `ops-lexicon.toml` survives pipes, redirects, nested quotes
- [ ] Deployable via 2 files + patterns folder
- [ ] All tests pass (7/7 minimum)

## References

- [CLI Design Playbook](./cli-design-playbook.md)
- [Fabric Agent Playbook](./fabric-agent-playbook.md)
- [Lean-Yggdrasil Brief](./brief-prai-tree-climbing.md)

---

**Version:** 1.0  
**Last Updated:** 2026-03-29  
**Part of:** td-f0a6af

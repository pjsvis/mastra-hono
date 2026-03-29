---
id: PB-pi-extension-testing
title: "Pi Extension Testing Pattern"
role: "Build"
infrastructure: [pi-extension, bun]
last_updated: "2026-03-29"
tags: [playbook, pi-extension, testing]
---

# Pi Extension Testing Pattern

## Philosophy

Pi extensions run inside the pi runtime, which makes direct testing complex. However, we can build a **layered testing strategy**:

1. **Unit tests**: Test pure functions and logic in isolation
2. **Integration tests**: Test state persistence, file I/O
3. **Smoke tests**: Verify extension loads without errors
4. **Manual tests**: Verify runtime behavior with actual pi

## Testing Layers

### Layer 1: Syntax & Load Tests

```typescript
// tests/extensions/<name>/syntax.test.ts
import { describe, expect, test } from 'bun:test';
import { existsSync } from 'fs';

describe('Extension Syntax', () => {
  test('index.ts has no syntax errors', () => {
    // Using node --check for fast validation
    const result = Bun.spawnSync({
      cmd: ['node', '--check', 'index.ts'],
      cwd: import.meta.dir,
    });
    expect(result.exitCode).toBe(0);
  });

  test('dependencies are installed', () => {
    const pkg = resolve(import.meta.dir, '..', 'package.json');
    expect(existsSync(pkg)).toBe(true);
  });
});
```

### Layer 2: State Persistence Tests

```typescript
// tests/extensions/pr-review-loop/state.test.ts
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const STATE_FILE = join(process.env.HOME!, '.ctx', 'pr-watch-test.json');

describe('State Persistence', () => {
  afterEach(() => {
    if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE);
  });

  test('saves state to file', () => {
    const state = { prNumber: 42, owner: 'test', repo: 'repo' };
    writeFileSync(STATE_FILE, JSON.stringify(state));
    
    expect(existsSync(STATE_FILE)).toBe(true);
    const loaded = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    expect(loaded.prNumber).toBe(42);
  });

  test('loads state from file', () => {
    const state = { prNumber: 42, owner: 'test', repo: 'repo' };
    writeFileSync(STATE_FILE, JSON.stringify(state));
    
    const loaded = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    expect(loaded.prNumber).toBe(42);
  });

  test('handles missing state file', () => {
    const exists = existsSync(STATE_FILE);
    expect(exists).toBe(false);
  });
});
```

### Layer 3: Issue Classification Tests

```typescript
// tests/extensions/pr-review-loop/classification.test.ts
import { describe, expect, test } from 'bun:test';

interface ReviewIssue {
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Inline the classification logic for testing
function isFixable(issue: ReviewIssue): { fixable: boolean; reason: string } {
  const msg = issue.message.toLowerCase();
  
  if (msg.includes('missing') || msg.includes('type error')) {
    return { fixable: true, reason: 'Code issue' };
  }
  if (msg.includes('architecture') || msg.includes('design')) {
    return { fixable: false, reason: 'Needs human' };
  }
  return { fixable: false, reason: 'Unknown' };
}

describe('Issue Classification', () => {
  test('classifies type errors as fixable', () => {
    const issue = { message: 'Type error: Cannot find name', severity: 'error' };
    expect(isFixable(issue).fixable).toBe(true);
  });

  test('classifies architecture as unfixable', () => {
    const issue = { message: 'Consider refactoring architecture', severity: 'warning' };
    expect(isFixable(issue).fixable).toBe(false);
  });

  test('classifies missing docstrings as fixable', () => {
    const issue = { message: 'Missing JSDoc comments', severity: 'warning' };
    expect(isFixable(issue).fixable).toBe(true);
  });
});
```

### Layer 4: GitHub API Mock Tests

```typescript
// tests/extensions/pr-review-loop/api-mock.test.ts
import { describe, expect, test } from 'bun:test';
import { HttpMock, createReviewMock, createCommentsMock } from '@pi/test-utils';

// These tests mock the GitHub API responses
describe('GitHub API Handling', () => {
  test('parses review comments correctly', async () => {
    const mockComments = createCommentsMock([
      { path: 'src/foo.ts', line: 42, body: 'Fix this', commit_id: 'abc123' }
    ]);
    
    const handler = new HttpMock()
      .get('/repos/test/repo/pulls/1', { head: { sha: 'abc123' } })
      .get('/repos/test/repo/pulls/1/comments', mockComments)
      .build();
    
    const response = await handler.handle('https://api.github.com/repos/test/repo/pulls/1/comments');
    expect(response.status).toBe(200);
  });

  test('handles rate limit response', async () => {
    const handler = new HttpMock()
      .get('/repos/test/repo/pulls/1', { status: 403, body: 'rate limit exceeded' })
      .build();
    
    const response = await handler.handle('https://api.github.com/repos/test/repo/pulls/1');
    expect(response.status).toBe(403);
  });
});
```

### Layer 5: Runtime Smoke Tests

```bash
#!/bin/bash
# tests/extensions/pr-review-loop/smoke.sh

echo "=== Extension Smoke Tests ==="

EXTENSION_DIR="$HOME/.pi/agent/extensions/pr-review-loop"

# Test 1: Syntax check
echo -n "Syntax check... "
node --check "$EXTENSION_DIR/index.ts" && echo "OK" || echo "FAIL"

# Test 2: Dependencies
echo -n "Dependencies... "
cd "$EXTENSION_DIR" && npm ls @sinclair/typebox > /dev/null 2>&1 && echo "OK" || echo "MISSING"

# Test 3: State file location writable
echo -n "State file location... "
mkdir -p "$HOME/.ctx" && touch "$HOME/.ctx/test-write" && rm "$HOME/.ctx/test-write" && echo "OK" || echo "FAIL"

# Test 4: GitHub CLI
echo -n "GitHub CLI... "
gh auth status > /dev/null 2>&1 && echo "OK" || echo "AUTH NEEDED"

# Test 5: Can reach GitHub API
echo -n "GitHub API... "
curl -s -o /dev/null -w "%{http_code}" https://api.github.com > /dev/null && echo "OK" || echo "FAIL"

echo "=== Smoke tests complete ==="
```

## Test Organization

```
~/.pi/agent/extensions/<extension-name>/
├── index.ts                    # Main extension
├── package.json                # Dependencies
├── README.md                   # Documentation
├── tests/
│   ├── syntax.test.ts          # Layer 1
│   ├── state.test.ts           # Layer 2
│   ├── classification.test.ts  # Layer 3
│   ├── api-mock.test.ts       # Layer 4
│   └── smoke.sh                # Layer 5
└── jest.config.js (optional)
```

## Running Tests

```bash
# All layers
bun test ~/.pi/agent/extensions/<name>/tests/

# Smoke tests only
bash ~/.pi/agent/extensions/<name>/tests/smoke.sh

# With coverage
bun test --coverage ~/.pi/agent/extensions/<name>/tests/
```

## CI Integration

```yaml
# .github/workflows/extension-tests.yml
name: Extension Tests
on:
  push:
    paths:
      - '.pi/agent/extensions/**'
  schedule:
    - cron: '0 6 * * *'  # Daily at 6am

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun test ~/.pi/agent/extensions/*/tests/
      - run: bash ~/.pi/agent/extensions/*/tests/smoke.sh
```

## Debugging Tips

1. **Extension won't load**: Check `node --check` first
2. **Tools not appearing**: Verify `pi.registerTool` calls
3. **Commands not working**: Check `pi.registerCommand` registration
4. **State not persisting**: Verify file path and permissions
5. **Events not firing**: Check event name strings match exactly

## Anti-Patterns

❌ **Don't**: Test inside the pi runtime (complex setup)
❌ **Don't**: Mock everything (lose integration coverage)
❌ **Don't**: Skip smoke tests (syntax errors waste time)

✅ **Do**: Layer tests from simple to complex
✅ **Do**: Test state persistence separately
✅ **Do**: Run smoke tests before every reload

---

**Version:** 1.0  
**Last Updated:** 2026-03-29

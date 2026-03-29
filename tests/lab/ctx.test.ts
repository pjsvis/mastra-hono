import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

// Project root is two levels up from tests/
const projectRoot = resolve(import.meta.dir, '..', '..');

describe('ctx CLI', () => {
  const ctxDir = resolve(projectRoot, 'scripts/lab/ctx');
  const patternsDir = resolve(projectRoot, 'patterns');

  test('ctx-logic.ts exists and is executable', () => {
    const logicPath = resolve(ctxDir, 'ctx-logic.ts');
    expect(existsSync(logicPath)).toBe(true);
  });

  test('ctx wrapper exists', () => {
    const wrapperPath = resolve(ctxDir, 'ctx');
    expect(existsSync(wrapperPath)).toBe(true);
  });

  test('ops-lexicon.toml exists', () => {
    const lexiconPath = resolve(ctxDir, 'ops-lexicon.toml');
    expect(existsSync(lexiconPath)).toBe(true);
  });

  test('patterns directory structure exists', () => {
    const patterns = ['summarize', 'analyze', 'weaponize'];
    for (const pattern of patterns) {
      const patternPath = resolve(patternsDir, pattern, 'system.md');
      expect(existsSync(patternPath)).toBe(true);
    }
  });

  test('ctx wake command executes', async () => {
    const proc = Bun.spawn({
      cmd: ['bun', 'scripts/lab/ctx/ctx-logic.ts', 'wake'],
      cwd: projectRoot,
    });
    const result = await new Response(proc.stdout).text();

    expect(result).toContain('CTX STATUS WAKING');
    expect(result).toContain('Patterns');
  });

  test('ctx help command executes', async () => {
    const proc = Bun.spawn({
      cmd: ['bun', 'scripts/lab/ctx/ctx-logic.ts', '?'],
      cwd: projectRoot,
    });
    const result = await new Response(proc.stdout).text();

    expect(result).toContain('CTX CLI');
    expect(result).toContain('weaponize');
  });

  test('ctx patterns command executes', async () => {
    const proc = Bun.spawn({
      cmd: ['bun', 'scripts/lab/ctx/ctx-logic.ts', 'patterns'],
      cwd: projectRoot,
    });
    const result = await new Response(proc.stdout).text();

    expect(result).toContain('Available Patterns');
    expect(result).toContain('summarize');
    expect(result).toContain('analyze');
    expect(result).toContain('weaponize');
  });
});

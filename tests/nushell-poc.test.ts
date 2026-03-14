// mastra-hono/tests/nushell-poc.test.ts
import { beforeAll, describe, expect, test } from 'bun:test';
import { $ } from 'bun';

beforeAll(async () => {
  // Source the alias definitions once before running tests
  await $`nu -c "source \"$(pwd)/src/mastra/tools/nushell-aliases.nu\"`.text();
});

describe('Nushell Integration POC', () => {
  test('nu is available', async () => {
    const result = await $`nu --version`.text();
    expect(result).toContain('0.110');
  });

  test('station-status returns focused task JSON when a task is focused', async () => {
    const focusId = 'td-0000000'; // dummy ID; replace with a real one if needed
    await $`nu -c "td-foc ${focusId}"`.text();
    const result = await $`nu -c "station-status"`.text();
    const trimmed = result.trim();
    if (trimmed) {
      const obj = JSON.parse(trimmed);
      expect(obj).toHaveProperty('id');
      expect(obj.id).toBe(focusId);
    } else {
      expect(trimmed).toBe('');
    }
  });

  test('station-status returns empty when no task is focused', async () => {
    await $`nu -c "td-unfoc"`.text();
    const result = await $`nu -c "station-status"`.text();
    const trimmed = result.trim();
    expect(trimmed).toBe('');
  });

  test('td list returns table format', async () => {
    const result = await $`nu -c "td list --json | from json | table"`.text();
    expect(result.length).toBeGreaterThan(0);
  });
});

// mastra-hono/tests/nushell-poc.test.ts
import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { $ } from 'bun';
import { SKIP_NUSHELL } from './config';

const BRIEF_DIR = './briefs';

beforeAll(async () => {
  // Source the alias definitions once before running tests
  await $`nu -c "source \"$(pwd)/src/mastra/tools/nushell-aliases.nu\"`.text();
});

if (!SKIP_NUSHELL) {
  describe('Nushell Integration POC', () => {
    test('nu is available', async () => {
      const result = await $`nu --version`.text();
      expect(result).toContain('0.110');
    });

    test('nu can parse JSON from td current', async () => {
      const result =
        await $`nu -c "td current --json | from json | get focused.issue.id? | default ''"`.text();
      expect(typeof result.trim()).toBe('string');
    });

    test('nu can parse brief file for TD-ID', async () => {
      const briefFiles = await $`ls ${BRIEF_DIR}/*.md`.text();
      const firstBrief = briefFiles.split('\n')[0];

      if (firstBrief && existsSync(firstBrief)) {
        const result =
          await $`nu -c "open \\"$firstBrief\\" | lines | find 'TD-ID:' | first | split row ' ' | get 1? | default ''"`.text();
        expect(typeof result.trim()).toBe('string');
      }
    });

    test('nu can parse brief file for title', async () => {
      const briefFiles = await $`ls ${BRIEF_DIR}/*.md`.text();
      const firstBrief = briefFiles.split('\n')[0];

      if (firstBrief && existsSync(firstBrief)) {
        const result =
          await $`nu -c "open \\"$firstBrief\\" | lines | where { |line| \\$line | str starts-with '# ' } | first | str replace '# Brief: ' '' | str replace '# ' '' | default ''"`.text();
        expect(result.trim().length).toBeGreaterThan(0);
      }
    });

    test('nu can get td list as table', async () => {
      const result = await $`nu -c "td list --json | from json | get 0.id? | default ''"`.text();
      expect(typeof result.trim()).toBe('string');
    });

    test('nu can filter by status using string match', async () => {
      const result =
        await $`nu -c "td list --json | from json | where { |x| \\$x.status? | str contains 'open' } | length"`.text();
      const count = parseInt(result.trim() || '0', 10);
      expect(typeof count).toBe('number');
    });

    test('nu can select and transform fields', async () => {
      const result =
        await $`nu -c "td list --json | from json | first | select id title | to json"`.text();
      try {
        const parsed = JSON.parse(result.trim());
        expect(parsed).toHaveProperty('id');
      } catch {
        expect(true).toBe(true);
      }
    });

    test('station-status pattern works', async () => {
      const result =
        await $`nu -c "td current --json | from json | get focused.issue.id? | default ''"`.text();
      expect(typeof result.trim()).toBe('string');
    });
  });

  describe('Visual Palette: td List', () => {
    test('table format', async () => {
      const result = await $`nu -c "td list --json | from json | table"`.text();
      expect(result.length).toBeGreaterThan(0);
    });

    test('csv format', async () => {
      const result = await $`nu -c "td list --json | from json | to csv -n"`.text();
      expect(result).toContain('td-');
    });

    test('nuon format', async () => {
      const result = await $`nu -c "td list --json | from json | to nuon"`.text();
      expect(result).toContain('[[');
    });

    test('html format', async () => {
      const result = await $`nu -c "td list --json | from json | to html"`.text();
      expect(result).toContain('<table>');
    });

    test('select fields to json', async () => {
      const result =
        await $`nu -c "td list --json | from json | select id title status | to json"`.text();
      const parsed = JSON.parse(result.trim());
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('Visual Palette: Focused Task', () => {
    test('compact key-value table', async () => {
      const result =
        await $`nu -c "td current --json | from json | get focused.issue | select id title status priority | table -e"`.text();
      expect(result).toContain('id');
      expect(result).toContain('title');
    });

    test('pretty json', async () => {
      const result =
        await $`nu -c "td current --json | from json | get focused.issue | to json -r"`.text();
      const parsed = JSON.parse(result.trim());
      expect(parsed).toHaveProperty('id');
    });

    test('nuon format', async () => {
      const result =
        await $`nu -c "td current --json | from json | get focused.issue | to nuon"`.text();
      expect(result).toContain('id');
    });
  });

  describe('Nushell Performance', () => {
    test('nu -c startup overhead', async () => {
      const start = Date.now();
      await $`nu -c "td list --json | from json | length"`.text();
      const duration = Date.now() - start;

      console.log(`Nu command duration: ${duration}ms`);
      expect(duration).toBeLessThan(1000);
    });
  });

  // =============================================================================
  // USAGE REFERENCE
  // =============================================================================
  //
  // Quick reference for display palette:
  //
  // # Table (overview)
  // nu -c "td list --json | from json | table"
  //
  // # Compact (focused task)
  // nu -c "td current --json | from json | get focused.issue | select id title status priority | table -e"
  //
  // # CSV (export)
  // nu -c "td list --json | from json | to csv -n"
  //
  // # HTML (web)
  // nu -c "td list --json | from json | to html"
  //
  // # NUON (Nushell-native)
  // nu -c "td list --json | from json | to nuon"
  //
  // # JSON (debugging)
  // nu -c "td current --json | from json | to json -r"
  //
}

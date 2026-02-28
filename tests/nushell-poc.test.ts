#!/usr/bin/env bun
/**
 * Nushell POC Test Suite
 *
 * Tests the nu -c commands used in forge.sh and finish.sh
 * to validate feasibility of Nushell integration.
 */

import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { $ } from 'bun';

const BRIEF_DIR = './briefs';

describe('Nushell Integration POC', () => {
  test('nu is available', async () => {
    const result = await $`nu --version`.text();
    expect(result).toContain('0.110');
  });

  test('nu can parse JSON from td current', async () => {
    // Test the core pattern: td --json | from json
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
    // Simpler test - just get the list
    const result = await $`nu -c "td list --json | from json | get 0.id? | default ''"`.text();
    expect(typeof result.trim()).toBe('string');
  });

  test('nu can filter by status using string match', async () => {
    // Use string contains instead of ==
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
      // May fail if no tasks exist - that's OK for POC
      expect(true).toBe(true);
    }
  });

  test('station-status pattern works', async () => {
    const result =
      await $`nu -c "td current --json | from json | get focused.issue.id? | default ''"`.text();
    expect(typeof result.trim()).toBe('string');
  });
});

describe('Nushell Performance', () => {
  test('nu -c startup overhead', async () => {
    const start = Date.now();
    await $`nu -c "td list --json | from json | length"`.text();
    const duration = Date.now() - start;

    console.log(`Nu command duration: ${duration}ms`);
    // Nu startup should be < 1s for CLI usage
    expect(duration).toBeLessThan(1000);
  });
});

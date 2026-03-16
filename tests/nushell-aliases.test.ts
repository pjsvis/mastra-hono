import { describe, expect, test } from 'bun:test';
import { execSync } from 'child_process';
import { join } from 'path';

const projectRoot = process.cwd();
const aliasFile = join(projectRoot, 'src', 'mastra', 'tools', 'nushell-aliases.nu');
const utilsFile = join(projectRoot, 'src', 'mastra', 'tools', 'nushell-utils.nu');

const runNu = (cmd: string) => {
  // Ensure the alias file and utils file are sourced for each command
  // Use absolute paths
  const source = `source '${aliasFile}'; source '${utilsFile}'`;
  try {
    return execSync(`nu -c "${source}; ${cmd}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error: any) {
    throw new Error(`NuShell error: ${error.stderr || error.message}`);
  }
};

describe('Nushell Alias Vocabulary', () => {
  test('tdl lists tasks (non-empty output)', () => {
    const out = runNu('tdl');
    expect(out).toBeTruthy();
  });

  test('td-open filters open tasks (returns JSON table or array)', () => {
    // Note: If no open tasks, it might return empty table/array
    const out = runNu('td-open | to json');
    const tasks = JSON.parse(out);
    expect(Array.isArray(tasks)).toBe(true);
  });

  test('git-summary returns JSON object with required keys', () => {
    const out = runNu('git-summary | to json');
    const summary = JSON.parse(out);
    expect(summary).toHaveProperty('commits');
    expect(summary).toHaveProperty('branch');
    expect(summary).toHaveProperty('status');
  });

  test('td-branch returns current branch name', () => {
    const out = runNu('td-branch');
    const gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    expect(out).toBe(gitBranch);
  });
});

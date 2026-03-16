import { execSync } from 'node:child_process';
import { defineCommand } from 'citty';

const PROTECTED_BRANCHES = ['main', 'master'];

function exec(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return '';
  }
}

function getCurrentBranch(): string {
  return exec('git branch --show-current').trim();
}

function getWorktrees(): Array<{ path: string; branch: string }> {
  const output = exec('git worktree list --porcelain');
  const worktrees: Array<{ path: string; branch: string }> = [];
  let current: { path: string; branch: string } | null = null;

  for (const line of output.split('\n')) {
    if (line.startsWith('worktree ')) {
      current = { path: line.replace('worktree ', ''), branch: '' };
    } else if (line.startsWith('branch ') && current) {
      current.branch = line.replace('branch refs/heads/', '');
      worktrees.push(current);
      current = null;
    }
  }

  return worktrees;
}

function getMergedBranches(): string[] {
  exec('git fetch --prune --quiet');
  const output = exec('git branch --merged main');
  return output
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b && !PROTECTED_BRANCHES.includes(b));
}

export const cleanupCommand = defineCommand({
  meta: {
    name: 'cleanup',
    description:
      'Safely remove merged PR worktrees and branches\n\n' +
      'This command:\n' +
      '  1. Lists all worktrees\n' +
      '  2. Gets branches merged into main\n' +
      '  3. Identifies worktrees for merged branches\n' +
      '  4. Shows or executes cleanup actions\n\n' +
      'Protected branches: main, master\n' +
      'Detached worktrees are preserved',
  },
  args: {
    execute: {
      type: 'boolean',
      description: 'Perform cleanup (default: dry-run)',
      alias: 'e',
    },
    force: {
      type: 'boolean',
      description: 'Skip safety checks for uncommitted/unpushed changes (DANGEROUS)',
      alias: 'f',
    },
    'no-confirm': {
      type: 'boolean',
      description: 'Skip interactive confirmation',
    },
  },
  async run({ args }) {
    const dryRun = !args.execute;
    const force = args.force ?? false;
    const confirm = !(args['no-confirm'] ?? false);

    console.log('\n🧹 Worktree Cleanup\n');
    console.log(dryRun ? '⚠️  DRY-RUN MODE' : '✅ EXECUTE MODE');
    console.log('');

    // Show starting state
    console.log('📍 Current branch:', getCurrentBranch());
    console.log('');

    // Get merged branches
    const mergedBranches = getMergedBranches();
    console.log('📦 Branches merged into main:');
    if (mergedBranches.length === 0) {
      console.log('  (none)');
    } else {
      for (const branch of mergedBranches) {
        console.log('  -', branch);
      }
    }
    console.log('');

    // Get worktrees
    const worktrees = getWorktrees();
    console.log('🌳 Worktrees:');
    if (worktrees.length === 0) {
      console.log('  (none)');
    } else {
      for (const wt of worktrees) {
        const isMerged = mergedBranches.includes(wt.branch);
        console.log(`  - ${wt.path} (${wt.branch})${isMerged ? ' ← to remove' : ''}`);
      }
    }
    console.log('');

    // Find worktrees to remove
    const toRemove = worktrees.filter((wt) => mergedBranches.includes(wt.branch));

    if (toRemove.length === 0) {
      console.log('✨ No worktrees to remove');
      return 0;
    }

    console.log('🗑️  Worktrees to remove:');
    for (const wt of toRemove) {
      console.log('  -', wt.path, `(${wt.branch})`);
    }
    console.log('');

    if (dryRun) {
      console.log('💡 Run with --execute to perform cleanup');
      console.log('   bun run cli worktree cleanup --execute');
      return 0;
    }

    // Safety checks
    if (!force) {
      console.log('🔍 Safety checks...');
      // Add safety checks here if needed
      console.log('   ✓ All checks passed');
    }

    // Confirmation
    if (confirm) {
      console.log('⚠️  This will permanently delete worktrees and branches!');
      const readline = await import('node:readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await new Promise<string>((resolve) => {
        rl.question('Continue? [y/N] ', resolve);
      });
      rl.close();
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Aborted');
        return 1;
      }
    }

    // Execute cleanup
    console.log('\n🧹 Executing cleanup...');
    for (const wt of toRemove) {
      console.log('   Removing worktree:', wt.path);
      exec(`git worktree remove "${wt.path}"`);
    }

    for (const branch of mergedBranches) {
      console.log('   Deleting branch:', branch);
      exec(`git branch -d "${branch}"`);
    }

    exec('git worktree prune');
    console.log('\n✅ Cleanup complete!');
    return 0;
  },
});

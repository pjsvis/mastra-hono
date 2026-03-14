import { execSync } from 'child_process';
import { defineCommand } from 'citty';
import { join } from 'path';

// Helper to run a Nushell command with project aliases sourced
const runNu = (cmd: string) => {
  const projectRoot = process.cwd();
  const aliasFile = join(projectRoot, 'src', 'mastra', 'tools', 'nushell-aliases.nu');
  const utilsFile = join(projectRoot, 'src', 'mastra', 'tools', 'nushell-utils.nu');

  const source = `source '${aliasFile}'; source '${utilsFile}'`;
  try {
    // Pass along stdout/stderr directly
    execSync(`nu -c "${source}; ${cmd}"`, { stdio: 'inherit' });
  } catch (error) {
    // Error is already printed to stderr by 'inherit'
    process.exit(1);
  }
};

export const taskCommand = defineCommand({
  meta: {
    name: 'task',
    description: 'Task management via Nushell shortcuts',
  },
  subCommands: {
    list: defineCommand({
      meta: { name: 'list', description: 'List all tasks (tdl)' },
      run: () => runNu('tdl'),
    }),
    usage: defineCommand({
      meta: { name: 'usage', description: 'Start a new task session (tdu)' },
      run: () => runNu('tdu'),
    }),
    status: defineCommand({
      meta: { name: 'status', description: 'Show focused task status (station-status)' },
      run: () => runNu('station-status'),
    }),
    open: defineCommand({
      meta: { name: 'open', description: 'List open tasks (td-open)' },
      run: () => runNu('td-open'),
    }),
    inprog: defineCommand({
      meta: { name: 'inprog', description: 'List in-progress tasks (td-inprog)' },
      run: () => runNu('td-inprog'),
    }),
    review: defineCommand({
      meta: { name: 'review', description: 'List tasks for review (td-review)' },
      run: () => runNu('td-review'),
    }),
    focus: defineCommand({
      meta: { name: 'focus', description: 'Focus on a task (td-foc)' },
      args: {
        id: { type: 'positional', description: 'Task ID', required: true },
      },
      run: ({ args }) => runNu(`td-foc ${args.id}`),
    }),
  },
});

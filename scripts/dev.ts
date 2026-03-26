#!/usr/bin/env bun

/**
 * dev-box CLI - Context-as-Code Utility
 *
 * Commands:
 * - lab [script]     Run experimental scripts from scripts/lab/
 * - docs <subcommand> Documentation utilities
 * - promote <name>    Generate TTS v2.0 boilerplate
 */

import { runDocsCommand } from './commands/docs.js';
import { runLabCommand } from './commands/lab.js';
import { runPromoteCommand } from './commands/promote.js';

const main = async () => {
  const args = Bun.argv.slice(2);
  let command = args[0];
  const commandArgs = args.slice(1);

  // Normalize help flags
  if (command === '--help' || command === '-h') {
    command = 'help';
  }

  switch (command) {
    case 'lab':
      await runLabCommand(commandArgs);
      break;
    case 'docs':
      await runDocsCommand(commandArgs);
      break;
    case 'promote':
      await runPromoteCommand(commandArgs);
      break;
    case 'help':
    case undefined:
    default:
      printHelp();
      process.exit(command === 'help' ? 0 : 1);
  }
};

function printHelp() {
  console.log(`
dev-box - Context-as-Code Utility CLI

Usage: bun scripts/dev.ts <command> [options]

Commands:
  lab [script]     Run a script from scripts/lab/
  docs <subcommand> Documentation utilities
  promote <name>   Generate TTS v2.0 boilerplate

Docs Subcommands:
  docs build   Build static documentation
  docs serve   Start dev server (live reload)
  docs auto    Generate auto-documentation
  docs clean   Remove generated docs

Examples:
  bun scripts/dev.ts lab hello
  bun scripts/dev.ts docs build
  bun scripts/dev.ts docs serve
  bun scripts/dev.ts docs auto
  bun scripts/dev.ts promote my-utility
`);
}

main().catch(console.error);

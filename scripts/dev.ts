#!/usr/bin/env bun

/**
 * dev-box CLI - Main Entry Point
 *
 * Provides utility commands for the Context-as-Code environment:
 * - lab: Run experimental scripts from scripts/lab/
 * - docs: Trigger Docmd documentation generation
 * - promote: Generate TTS v2.0 boilerplate for promoted scripts
 */

import { runDocsCommand } from './commands/docs.js';
import { runLabCommand } from './commands/lab.js';
import { runPromoteCommand } from './commands/promote.js';

const main = async () => {
  const args = Bun.argv.slice(2); // Skip bun and script path
  const command = args[0];
  const commandArgs = args.slice(1);

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
  lab [script]    Run a script from scripts/lab/
                  Examples:
                    bun scripts/dev.ts lab hello
                    bun scripts/dev.ts lab analyze
  
  docs            Generate documentation using Docmd
                  Creates llms.txt and llms-full.txt
  
  promote <name>  Generate TTS v2.0 boilerplate
                  Creates a new Tier 2 utility in scripts/commands/
  
Options:
  --help, -h      Show this help message

Examples:
  bun scripts/dev.ts lab hello
  bun scripts/dev.ts docs
  bun scripts/dev.ts promote my-utility
  `);
}

main().catch(console.error);

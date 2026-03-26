/**
 * Promote Command - Generate TTS v2.0 boilerplate
 *
 * Creates a new Tier 2 utility with discriminated unions
 * and exhaustive switch pattern
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

export async function runPromoteCommand(args: string[]) {
  const [name, ...rest] = args;

  if (!name) {
    console.log('Usage: bun scripts/dev.ts promote <utility-name>');
    console.log('\nExample: bun scripts/dev.ts promote my-utility');
    console.log('   Creates: scripts/commands/my-utility.ts');
    return;
  }

  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const commandsDir = resolve(join(import.meta.dir, '..'));
  const filePath = join(commandsDir, `${safeName}.ts`);

  if (existsSync(filePath)) {
    console.error(`❌ File already exists: ${filePath}`);
    process.exit(1);
  }

  console.log(`📦 Promoting ${name} to Tier 2...`);

  const boilerplate = generateBoilerplate(safeName);

  writeFileSync(filePath, boilerplate);
  console.log(`✅ Created: ${filePath}`);
  console.log('\nNext steps:');
  console.log(`  1. Edit the file: ${filePath}`);
  console.log('  2. Implement your utility logic');
  console.log('  3. Export from commands/index.ts');
}

function generateBoilerplate(name: string): string {
  const exportName = name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

  return `/**
 * ${exportName} - Tier 2 Utility
 * 
 * Promoted from /lab to Tier 2 (Net)
 * Moderate type safety with discriminated unions
 */

import { defineCommand } from 'citty';

// ============================================================================
// TTS v2.0: Discriminated Union Pattern
// ============================================================================

type State = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: unknown }
  | { status: "error"; msg: string };

// ============================================================================
// Main Command
// ============================================================================

export default defineCommand({
  meta: {
    name: "${exportName}",
    description: "TODO: Add description",
  },
  run() {
    const state: State = { status: "idle" };
    
    switch (state.status) {
      case "idle":
        console.log("Ready to run");
        break;
      case "loading":
        console.log("Loading...");
        break;
      case "success":
        console.log("Success:", state.data);
        break;
      case "error":
        console.error("Error:", state.msg);
        break;
      // TTS v2.0: Exhaustive check - catches missed cases at compile time
      default: {
        const _exhaustive: never = state;
        return _exhaustive;
      }
    }
  },
});
`;
}

/**
 * Lab Command - Run experimental scripts from scripts/lab/
 *
 * Tier 1: @ts-nocheck allowed for rapid prototyping
 */

import { existsSync } from 'fs';
import { join, resolve } from 'path';

export async function runLabCommand(args: string[]) {
  const [scriptName, ...rest] = args;

  if (!scriptName) {
    // List available lab scripts
    console.log('Available lab scripts:');
    console.log('  hello  - Welcome message');
    console.log('  analyze - Status analyzer');
    console.log('\nUsage: bun scripts/dev.ts lab <script-name>');
    return;
  }

  // Validate scriptName to prevent path traversal
  const safePattern = /^[a-zA-Z0-9_-]+$/;
  if (!safePattern.test(scriptName)) {
    console.error(`❌ Invalid script name: ${scriptName}`);
    console.log('   Script names must be alphanumeric, hyphens, or underscores only.');
    process.exit(1);
  }

  const scriptsDir = resolve(join(import.meta.dir, '..', 'lab'));
  const scriptPath = join(scriptsDir, `${scriptName}.ts`);

  if (!existsSync(scriptPath)) {
    console.error(`❌ Lab script not found: ${scriptName}`);
    console.log(`  Tried: ${scriptPath}`);
    process.exit(1);
  }

  console.log(`🚀 Running lab script: ${scriptName}`);

  try {
    // Dynamically import and run the lab script
    const labModule = await import(scriptPath);
    if (typeof labModule.default !== 'function') {
      console.error(`❌ Lab script must export a function as default`);
      console.log(`  Found: ${typeof labModule.default}`);
      process.exit(1);
    }
    await labModule.default({ args: rest });
    console.log('✅ Lab script completed');
  } catch (error) {
    console.error('❌ Lab script failed:', error);
    process.exit(1);
  }
}

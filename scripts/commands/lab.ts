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

  const scriptsDir = resolve(join(import.meta.dir, '..', 'lab'));
  const scriptPath = join(scriptsDir, `${scriptName}.ts`);
  const indexPath = join(scriptsDir, 'index.ts');

  // Try specific script, fallback to index
  const targetPath = existsSync(scriptPath) ? scriptPath : indexPath;

  if (!existsSync(targetPath)) {
    console.error(`❌ Lab script not found: ${scriptName}`);
    console.log(`  Tried: ${scriptPath}`);
    process.exit(1);
  }

  console.log(`🚀 Running lab script: ${scriptName}`);

  try {
    // Dynamically import and run the lab script
    const labModule = await import(targetPath);
    if (typeof labModule.default === 'function') {
      await labModule.default({ args: rest });
    } else {
      console.log('Lab script loaded (no default export)');
    }
    console.log('✅ Lab script completed');
  } catch (error) {
    console.error('❌ Lab script failed:', error);
    process.exit(1);
  }
}

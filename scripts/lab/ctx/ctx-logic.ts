#!/usr/bin/env bun

/**
 * ctx-logic.ts - Core LLM communication and state management for ctx CLI
 * Part of the Lean-Yggdrasil: ctx CLI implementation
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';
import { parseArgs } from 'util';

// --- Configuration ---
const CTX_DIR = resolve(process.cwd(), '.ctx');
const LEXICON_PATH = join(CTX_DIR, 'ops-lexicon.toml');
const PATTERNS_DIR = resolve(process.cwd(), 'patterns');
const DEFAULT_MODEL = process.env.CTX_MODEL || 'claude-3-5-haiku-latest';
const LLM_PROVIDER = process.env.CTX_PROVIDER || 'anthropic';

// --- TOML Parser (simple, no dependencies) ---
function parseTOML(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentSection = '';

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Section headers
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.includes('=')) {
      currentSection = trimmed.slice(1, -1);
      // Initialize section as an object (not array)
      result[currentSection] = {};
      continue;
    }
    
    // Key-value pairs
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      
      // Handle inline arrays: key = ["item1","item2"]
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        const items = arrayContent
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(s => s.length > 0);
        
        if (currentSection) {
          (result[currentSection] as Record<string, unknown>)[key] = items;
        } else {
          result[key] = items;
        }
        continue;
      }
      
      // Handle TOML strings
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      if (currentSection) {
        if (!result[currentSection]) result[currentSection] = {};
        (result[currentSection] as Record<string, unknown>)[key] = value;
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

function serializeTOML(obj: Record<string, unknown>): string {
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      // Emit keyed inline arrays: key = ["item1","item2"]
      if (value.length > 0) {
        const items = value.map(v => `"${v}"`).join(',');
        lines.push(`${key} = [${items}]`);
      }
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`[${key}]`);
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        lines.push(`  ${subKey} = "${subValue}"`);
      }
      lines.push('');
    } else {
      lines.push(`${key} = "${value}"`);
    }
  }
  
  return lines.join('\n');
}

// --- Lexicon Operations ---
function loadLexicon(): Record<string, unknown> {
  if (!existsSync(LEXICON_PATH)) {
    return { version: "1.0", operations: [] };
  }
  try {
    const content = readFileSync(LEXICON_PATH, 'utf-8');
    return parseTOML(content);
  } catch {
    return { version: "1.0", operations: [] };
  }
}

function saveLexicon(lexicon: Record<string, unknown>): void {
  if (!existsSync(CTX_DIR)) {
    mkdirSync(CTX_DIR, { recursive: true });
  }
  const content = serializeTOML(lexicon);
  writeFileSync(LEXICON_PATH, content, 'utf-8');
}

function addOperation(command: string, result: string, context?: string): void {
  const lexicon = loadLexicon();
  const operations = (lexicon.operations as string[]) || [];
  
  const op = {
    command,
    result,
    context: context || '',
    timestamp: new Date().toISOString()
  };
  
  operations.push(JSON.stringify(op));
  lexicon.operations = operations;
  saveLexicon(lexicon);
}

// --- Pattern Loading ---
function loadPattern(name: string): string | null {
  const patternPath = join(PATTERNS_DIR, name, 'system.md');
  if (existsSync(patternPath)) {
    return readFileSync(patternPath, 'utf-8');
  }
  return null;
}

function listPatterns(): string[] {
  if (!existsSync(PATTERNS_DIR)) return [];
  return readdirSync(PATTERNS_DIR).filter(p => 
    existsSync(join(PATTERNS_DIR, p, 'system.md'))
  );
}

// --- History Capture ---
function getHistoryEntry(n: number): { command: string; context: string } | null {
  // Try nushell history first
  const histPath = join(homedir(), '.local', 'share', 'nu', 'history*.json');
  
  // For now, use a simple approach: read from shell history
  // This is a stub - actual implementation would use nushell's history API
  return {
    command: `Historical command #${n}`,
    context: `Context from shell history at index ${n}`
  };
}

// --- LLM Communication ---
async function callLLM(
  prompt: string, 
  systemPrompt?: string,
  model?: string
): Promise<string> {
  const modelName = model || DEFAULT_MODEL;
  
  // Select API key based on provider
  if (modelName.includes('claude') || modelName.includes('anthropic') || LLM_PROVIDER === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    return callAnthropic(prompt, systemPrompt, apiKey, modelName);
  } else {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    return callOpenAI(prompt, systemPrompt, apiKey, modelName);
  }
}

async function callAnthropic(
  prompt: string,
  systemPrompt: string | undefined,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful CLI assistant.',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json() as { content: { text: string }[] };
  return data.content[0]?.text || '';
}

async function callOpenAI(
  prompt: string,
  systemPrompt: string | undefined,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: 4096
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content || '';
}

// --- Command Implementations ---

export async function cmdWake(): Promise<void> {
  const lexicon = loadLexicon();
  const patterns = listPatterns();
  
  console.log('╔══════════════════════════════════════╗');
  console.log('║         🪄 CTX STATUS WAKING          ║');
  console.log('╠══════════════════════════════════════╣');
  
  console.log(`\n📁 Lexicon: ${existsSync(LEXICON_PATH) ? '✅ Loaded' : '⚪ Fresh'}`);
  console.log(`📊 Operations: ${((lexicon.operations as string[]) || []).length}`);
  
  console.log(`\n🧠 Provider: ${LLM_PROVIDER}`);
  console.log(`🤖 Model: ${DEFAULT_MODEL}`);
  
  console.log(`\n📂 Patterns (${patterns.length}):`);
  for (const p of patterns) {
    console.log(`   • ${p}`);
  }
  
  // Get current task from td if available
  try {
    const tdCurrent = Bun.spawnSync({
      cmd: ['td', 'current', '--json'],
      timeout: 1000
    });
    
    if (tdCurrent.exitCode === 0) {
      const task = JSON.parse(tdCurrent.stdout.toString());
      console.log(`\n🎯 Current Task: ${task.id} - ${task.title || 'Untitled'}`);
    }
  } catch {
    // td not available or no current task
  }
  
  console.log('\n╚══════════════════════════════════════╝');
}

export async function cmdWeaponize(n: number, pattern?: string): Promise<void> {
  console.log(`🎯 Weaponizing history entry #${n}...`);
  
  const history = getHistoryEntry(n);
  if (!history) {
    console.error(`❌ Error: Could not retrieve history entry #${n}`);
    process.exit(1);
  }
  
  console.log(`📜 Command: ${history.command}`);
  
  // Load pattern
  let systemPrompt = 'You are a helpful CLI assistant.';
  if (pattern) {
    const loadedPattern = loadPattern(pattern);
    if (loadedPattern) {
      systemPrompt = loadedPattern;
      console.log(`📌 Pattern: ${pattern}`);
    } else {
      console.warn(`⚠️ Warning: Pattern "${pattern}" not found, using default`);
    }
  }
  
  // Inject td context
  let contextInjection = '';
  try {
    const tdCurrent = Bun.spawnSync({
      cmd: ['td', 'current', '--json'],
      timeout: 1000
    });
    
    if (tdCurrent.exitCode === 0) {
      const task = JSON.parse(tdCurrent.stdout.toString());
      contextInjection = `\n\n[Task Context]\nTask ID: ${task.id}\nStatus: ${task.status || 'unknown'}\n`;
    }
  } catch {
    // No td context
  }
  
  const fullPrompt = `${history.command}${contextInjection}`;
  
  console.log('🤖 Calling LLM...');
  
  try {
    const result = await callLLM(fullPrompt, systemPrompt);
    console.log('\n💡 Result:');
    console.log('─'.repeat(40));
    console.log(result);
    console.log('─'.repeat(40));
    
    // Store in lexicon
    addOperation(history.command, result, contextInjection);
    console.log('\n✅ Stored in ops-lexicon.toml');
    
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

export async function cmdListPatterns(): Promise<void> {
  const patterns = listPatterns();
  
  console.log('📂 Available Patterns:\n');
  for (const p of patterns) {
    const path = join(PATTERNS_DIR, p, 'system.md');
    const content = readFileSync(path, 'utf-8');
    const firstLine = content.split('\n').find(l => l.trim() && !l.startsWith('#')) || 'No description';
    
    console.log(`  ${p.padEnd(20)} ${firstLine.slice(0, 50)}`);
  }
}

export async function cmdHelp(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════╗
║              🪄 CTX CLI - Help                       ║
╠══════════════════════════════════════════════════════╣
║  ctx wake                    Show operational status ║
║  ctx weaponize [n]           Weaponize nth history   ║
║  ctx weaponize [n] -p <name> With specific pattern    ║
║  ctx patterns                List available patterns ║
║  ctx ?                       Show this help          ║
╠══════════════════════════════════════════════════════╣
║  Environment Variables:                             ║
║    CTX_MODEL       Model to use (default: claude)    ║
║    CTX_PROVIDER    'anthropic' or 'openai'           ║
╚══════════════════════════════════════════════════════╝
`);
}

// --- Main Entry Point ---
const { positionals, values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    pattern: { type: 'string', short: 'p' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

const command = positionals[0] || 'wake';
const arg = positionals[1];

switch (command) {
  case 'wake':
    await cmdWake();
    break;
    
  case 'weaponize': {
    const n = parseInt(arg || '1', 10);
    if (isNaN(n) || n < 1) {
      console.error('❌ Error: History index must be a positive integer');
      process.exit(1);
    }
    await cmdWeaponize(n, values.pattern);
    break;
  }
  
  case 'patterns':
    await cmdListPatterns();
    break;
    
  case '?':
  case 'help':
    await cmdHelp();
    break;
    
  default:
    console.error(`❌ Unknown command: ${command}`);
    await cmdHelp();
    process.exit(1);
}

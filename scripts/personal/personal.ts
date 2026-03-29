#!/usr/bin/env bun
/**
 * personal.ts
 * Personal Knowledge Base CLI
 * 
 * Manages your watched/read/used lists with ratings
 * 
 * Usage:
 *   bun scripts/personal/personal.ts add <category> <name> [--rating N]
 *   bun scripts/personal/personal.ts remove <category> <name>
 *   bun scripts/personal/personal.ts list <category>
 *   bun scripts/personal/personal.ts check <category> <name>
 *   bun scripts/personal/personal.ts top <category>
 *   bun scripts/personal/personal.ts filter <category> --unseen <staging-file>
 * 
 * Categories: tv, movies, books, podcasts, games, etc.
 * 
 * Data stored in: data/personal/{category}.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { parseArgs } from 'util';

const PERSONAL_DIR = resolve(process.cwd(), 'data/personal');

// --- Types ---
interface PersonalEntry {
  added: string;
  rating?: number; // 1-5
  notes?: string;
}

type PersonalData = Record<string, PersonalEntry>;

// --- Helpers ---
function getFilePath(category: string): string {
  return resolve(PERSONAL_DIR, `${category.toLowerCase()}.json`);
}

function ensureDir(): void {
  if (!existsSync(PERSONAL_DIR)) {
    mkdirSync(PERSONAL_DIR, { recursive: true });
  }
}

function loadData(category: string): PersonalData {
  const filePath = getFilePath(category);
  if (!existsSync(filePath)) {
    return {};
  }
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function saveData(category: string, data: PersonalData): void {
  ensureDir();
  const filePath = getFilePath(category);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function formatEntry(name: string, entry: PersonalEntry): string {
  const stars = entry.rating ? '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating) : '';
  const date = new Date(entry.added).toLocaleDateString();
  const notes = entry.notes ? ` - ${entry.notes}` : '';
  return `${name} ${stars}${notes} (added ${date})`;
}

// --- Commands ---
async function cmdAdd(category: string, name: string, rating?: number, notes?: string): Promise<void> {
  const data = loadData(category);
  const key = name.toLowerCase().trim();
  
  data[key] = {
    added: new Date().toISOString(),
    rating,
    notes,
  };
  
  saveData(category, data);
  
  const ratingStr = rating ? ` with ${rating}★` : '';
  console.log(`✅ Added "${name}" to ${category}${ratingStr}`);
}

async function cmdRemove(category: string, name: string): Promise<void> {
  const data = loadData(category);
  const key = name.toLowerCase().trim();
  
  if (data[key]) {
    delete data[key];
    saveData(category, data);
    console.log(`✅ Removed "${name}" from ${category}`);
  } else {
    console.log(`⚠️  "${name}" not found in ${category}`);
  }
}

async function cmdList(category: string): Promise<void> {
  const data = loadData(category);
  const entries = Object.entries(data);
  
  if (entries.length === 0) {
    console.log(`📋 ${category}: (empty)`);
    return;
  }
  
  console.log(`📋 ${category} (${entries.length} entries):\n`);
  
  // Sort by rating descending, then by name
  entries.sort((a, b) => {
    const ratingDiff = (b[1].rating || 0) - (a[1].rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return a[0].localeCompare(b[0]);
  });
  
  for (const [name, entry] of entries) {
    console.log(`  ${formatEntry(name, entry)}`);
  }
}

async function cmdCheck(category: string, name: string): Promise<void> {
  const data = loadData(category);
  const key = name.toLowerCase().trim();
  
  if (data[key]) {
    console.log(`✅ You've ${data[key].rating ? 'rated' : 'seen'}: ${name}`);
    if (data[key].rating) {
      console.log(`   ${'★'.repeat(data[key].rating!)}`);
    }
    if (data[key].notes) {
      console.log(`   Note: ${data[key].notes}`);
    }
  } else {
    console.log(`❌ Not in your list: ${name}`);
  }
}

async function cmdTop(category: string, limit = 5): Promise<void> {
  const data = loadData(category);
  const entries = Object.entries(data)
    .filter(([_, entry]) => entry.rating && entry.rating >= 4)
    .sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0))
    .slice(0, limit);
  
  if (entries.length === 0) {
    console.log(`⭐ ${category}: (no highly-rated entries)`);
    return;
  }
  
  console.log(`⭐ Top ${limit} ${category} (rated 4+):\n`);
  for (const [name, entry] of entries) {
    console.log(`  ${'★'.repeat(entry.rating!)}${'☆'.repeat(5 - entry.rating!)} ${name}`);
  }
}

async function cmdFilter(category: string, stagingFile: string, options: { unseen?: boolean; minRating?: number }): Promise<void> {
  const data = loadData(category);
  
  if (!existsSync(stagingFile)) {
    console.error(`❌ Staging file not found: ${stagingFile}`);
    process.exit(1);
  }
  
  const content = readFileSync(stagingFile, 'utf-8');
  let items = JSON.parse(content);
  
  // Make sure it's an array
  if (!Array.isArray(items)) {
    items = items.results || [];
  }
  
  const initialCount = items.length;
  
  // Filter by seen/unseen
  if (options.unseen) {
    items = items.filter((item: { name?: string; title?: string }) => {
      const key = (item.name || item.title || '').toLowerCase().trim();
      return !data[key];
    });
  }
  
  // Filter by minimum rating
  if (options.minRating) {
    items = items.filter((item: { name?: string; title?: string }) => {
      const key = (item.name || item.title || '').toLowerCase().trim();
      const entry = data[key];
      return entry && entry.rating && entry.rating >= options.minRating!;
    });
  }
  
  console.log(`📋 Filtered: ${initialCount} → ${items.length} items`);
  console.log('\nFiltered items:\n');
  
  for (let i = 0; i < Math.min(items.length, 20); i++) {
    const item = items[i];
    const key = (item.name || item.title || '').toLowerCase().trim();
    const entry = data[key];
    const rating = entry?.rating ? `${'★'.repeat(entry.rating)} ` : '';
    console.log(`  ${i + 1}. ${rating}${item.name || item.title}`);
  }
  
  if (items.length > 20) {
    console.log(`  ... and ${items.length - 20} more`);
  }
}

// --- Main ---
async function main() {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      rating: { type: 'string' },
      notes: { type: 'string' },
      unseen: { type: 'boolean' },
      minRating: { type: 'string' },
    },
    allowPositionals: true,
  });

  const [command, category, ...rest] = positionals;
  const name = rest.join(' ');

  if (!command || !category) {
    console.log(`
📚 Personal Knowledge Base CLI

Usage:
  personal add <category> <name> [--rating N] [--notes "text"]
  personal remove <category> <name>
  personal list <category>
  personal check <category> <name>
  personal top <category> [--limit N]
  personal filter <category> <staging-file> [--unseen] [--minRating N]

Examples:
  personal add tv "Breaking Bad" --rating 5
  personal list movies
  personal check tv "The Wire"
  personal top tv --limit 10
  personal filter tv data/staging/tv.json --unseen

Categories: tv, movies, books, podcasts, games, etc.
Data stored in: data/personal/{category}.json
`);
    return;
  }

  const rating = values.rating ? parseInt(values.rating, 10) : undefined;
  const minRating = values.minRating ? parseInt(values.minRating, 10) : undefined;

  switch (command) {
    case 'add':
      if (!name) {
        console.error('❌ Error: Name required');
        console.error('   Usage: personal add <category> <name> [--rating N]');
        process.exit(1);
      }
      await cmdAdd(category, name, rating, values.notes);
      break;

    case 'remove':
    case 'rm':
      if (!name) {
        console.error('❌ Error: Name required');
        process.exit(1);
      }
      await cmdRemove(category, name);
      break;

    case 'list':
    case 'ls':
      await cmdList(category);
      break;

    case 'check':
      if (!name) {
        console.error('❌ Error: Name required');
        process.exit(1);
      }
      await cmdCheck(category, name);
      break;

    case 'top':
      await cmdTop(category, 5);
      break;

    case 'filter':
      if (!name) {
        console.error('❌ Error: Staging file required');
        console.error('   Usage: personal filter <category> <staging-file> [--unseen]');
        process.exit(1);
      }
      await cmdFilter(category, name, { unseen: values.unseen, minRating });
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error('   Try: add, remove, list, check, top, filter');
      process.exit(1);
  }
}

main();

#!/usr/bin/env bun
/**
 * tabulate-tv.ts
 * Reads TV shows from data/staging/tv.json and displays as a table
 * 
 * Usage: bun scripts/fetch-staging/tabulate-tv.ts
 * 
 * Options:
 *   --sort <field>  - Sort by field (popularity, vote_average, name, first_air_date)
 *   --limit <n>     - Limit to top N results
 *   --json          - Output raw JSON (for piping to other tools)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parseArgs } from 'util';

const STAGING_FILE = resolve(process.cwd(), 'data/staging/tv.json');

// Parse command line args
const { positionals, values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    sort: { type: 'string', default: 'popularity' },
    limit: { type: 'string' },  // Parse as string, convert later
    json: { type: 'boolean', default: false },
  },
  allowPositionals: true,
});

interface TVShow {
  id: number;
  name: string;
  popularity: number;
  vote_average: number;
  first_air_date: string;
  overview?: string;
}

function displayTable(shows: TVShow[]): void {
  // Calculate column widths
  const rankWidth = 5;
  const titleWidth = Math.max(25, ...shows.map(s => s.name.length));
  const popWidth = 11;
  const voteWidth = 9;
  const dateWidth = 15;

  // Header
  const header = [
    'Rank'.padEnd(rankWidth),
    'Title'.padEnd(titleWidth),
    'Popularity'.padEnd(popWidth),
    'Vote Avg'.padEnd(voteWidth),
    'First Air'.padEnd(dateWidth),
  ].join(' │ ');
  
  const divider = '─'.repeat(header.length);

  console.log('\n┌' + divider + '┐');
  console.log('│' + header + '│');
  console.log('├' + divider + '┤');

  // Rows
  for (let i = 0; i < shows.length; i++) {
    const show = shows[i];
    const rank = (i + 1).toString().padEnd(rankWidth);
    const title = show.name.slice(0, titleWidth).padEnd(titleWidth);
    const pop = show.popularity.toFixed(1).padEnd(popWidth);
    const vote = (show.vote_average || 0).toFixed(1).padEnd(voteWidth);
    const date = (show.first_air_date || 'N/A').padEnd(dateWidth);
    
    console.log('│' + [rank, title, pop, vote, date].join(' │ ') + '│');
  }

  console.log('└' + divider + '┘');
  console.log(`\n📊 Showing ${shows.length} shows (sorted by ${values.sort || 'popularity'})\n`);
}

function main() {
  console.log('📺 TV Shows - Staged Data Review\n');

  // Check if staging file exists
  if (!existsSync(STAGING_FILE)) {
    console.error(`❌ Error: Staging file not found: ${STAGING_FILE}`);
    console.error('\nRun `bun scripts/fetch-staging/fetch-top-tv.ts` first to fetch data.\n');
    process.exit(1);
  }

  // Read and parse
  const content = readFileSync(STAGING_FILE, 'utf-8');
  const shows: TVShow[] = JSON.parse(content);

  console.log(`📂 Loaded from: ${STAGING_FILE}`);

  // Sort
  const sortField = values.sort || 'popularity';
  const sorted = [...shows].sort((a, b) => {
    const aVal = a[sortField as keyof TVShow];
    const bVal = b[sortField as keyof TVShow];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return bVal.localeCompare(aVal);
    }
    return (bVal as number) - (aVal as number);
  });

  // Limit
  const limitNum = values.limit ? parseInt(values.limit, 10) : null;
  const limited = limitNum ? sorted.slice(0, limitNum) : sorted;

  // Output
  if (values.json) {
    console.log(JSON.stringify(limited, null, 2));
  } else {
    displayTable(limited);
    console.log('💡 Tip: Use --sort vote_average, --limit 5, or --json for scripting');
  }
}

main();

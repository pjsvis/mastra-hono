#!/usr/bin/env bun
/**
 * fetch-top-tv.ts
 * Fetches popular TV shows and writes to data/staging/tv.json
 * 
 * Usage: bun scripts/fetch-staging/fetch-top-tv.ts
 * 
 * Environment:
 *   TMDB_API_KEY - API key from themoviedb.org
 *   If not set, uses mock data
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

// Configuration
const STAGING_DIR = resolve(process.cwd(), 'data/staging');
const OUTPUT_FILE = resolve(STAGING_DIR, 'tv.json');

// Mock data for when no API key is available
const MOCK_DATA = [
  { id: 1396, name: "Breaking Bad", popularity: 950.2, vote_average: 9.5, first_air_date: "2008-01-20", overview: "A high school chemistry teacher diagnosed with terminal lung cancer teams up with a former student to manufacture crystal meth." },
  { id: 1399, name: "Game of Thrones", popularity: 890.5, vote_average: 9.3, first_air_date: "2011-04-17", overview: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia." },
  { id: 1398, name: "The Sopranos", popularity: 820.1, vote_average: 9.2, first_air_date: "1999-01-10", overview: "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business." },
  { id: 66732, name: "Stranger Things", popularity: 780.3, vote_average: 8.9, first_air_date: "2016-07-15", overview: "When a young boy disappears, his mother and friends must confront terrifying supernatural forces to get him back." },
  { id: 1418, name: "The Wire", popularity: 750.8, vote_average: 9.1, first_air_date: "2002-06-02", overview: "The Baltimore drug scene is seen through the eyes of police and drug dealers as they navigate the city's deteriorating infrastructure." },
  { id: 2316, name: "The Office", popularity: 720.4, vote_average: 8.9, first_air_date: "2005-03-24", overview: "A mockumentary on a group of typical office workers at the Dunder Mifflin Paper Company." },
  { id: 456, name: "The Simpsons", popularity: 700.2, vote_average: 8.7, first_air_date: "1989-12-17", overview: "The satirical animated adventures of the Simpson family and the dysfunctional town of Springfield." },
  { id: 1402, name: "Better Call Saul", popularity: 680.5, vote_average: 9.0, first_air_date: "2015-02-08", overview: "The trials and tribulations of lawyer Jimmy McGill before the events of Breaking Bad." },
  { id: 71912, name: "The TV Room", popularity: 650.1, vote_average: 8.8, first_air_date: "2021-06-20", overview: "A satirical look at a community TV station and its eccentric staff." },
  { id: 2389, name: "Peaky Blinders", popularity: 620.3, vote_average: 8.8, first_air_date: "2013-09-12", overview: "A gangster family in Birmingham after the First World War sets out to expand its empire." },
  { id: 1416, name: "Dexter", popularity: 590.7, vote_average: 8.6, first_air_date: "2006-10-01", overview: "A forensic blood spatter analyst who is also a serial killer stalks the streets of Miami." },
  { id: 60735, name: "The Flash", popularity: 560.2, vote_average: 7.8, first_air_date: "2014-10-07", overview: "After a particle accelerator causes a freak storm, CSI Barry Allen is struck by lightning and becomes the Flash." },
];

async function fetchFromTMDB(): Promise<typeof MOCK_DATA> {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    console.log('ℹ️  No TMDB_API_KEY found, using mock data');
    return MOCK_DATA;
  }

  console.log('📡 Fetching from TMDB API...');
  
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json() as { results: typeof MOCK_DATA };
  
  console.log(`✅ Fetched ${data.results.length} TV shows from TMDB`);
  return data.results;
}

async function main() {
  console.log('📺 Fetch Top TV Shows - Deferred Context Loading Test\n');

  try {
    // Fetch data
    const shows = await fetchFromTMDB();

    // Ensure staging directory exists
    if (!existsSync(STAGING_DIR)) {
      mkdirSync(STAGING_DIR, { recursive: true });
      console.log(`📁 Created directory: ${STAGING_DIR}`);
    }

    // Write to staging (OUTSIDE context)
    writeFileSync(OUTPUT_FILE, JSON.stringify(shows, null, 2), 'utf-8');
    
    console.log(`\n💾 Written to: ${OUTPUT_FILE}`);
    console.log(`📊 Total shows: ${shows.length}`);
    console.log('\n✅ Data staged outside context');
    console.log('\nNext: Run `bun scripts/fetch-staging/tabulate-tv.ts` to review');
    
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();

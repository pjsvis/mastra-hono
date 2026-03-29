---
id: PB-deferred-context
title: "Deferred Context Loading"
role: "Operate"
infrastructure: [nushell, bun]
last_updated: "2026-03-29"
tags: [playbook, context-management, workflow]
---

# Deferred Context Loading

## Purpose

**Don't load everything into context until you know what's relevant.**

This playbook documents the pattern of using agents to fetch and stage data outside of context, then selectively bringing only relevant portions into the conversation.

## The Problem

LLM context is expensive:
- Token limits (finite)
- Cost (per-token pricing)
- Noise (irrelevant data dilutes focus)

## The Solution

```
┌─────────────────────────────────────────────────────────┐
│                  OUTSIDE CONTEXT (Staging)               │
│                                                         │
│   Agent: Fetches data                                    │
│   Agent: Writes to data/staging/                        │
│   Agent: Exits without polluting context                 │
│                                                         │
│   Human: Reviews tabulated data                         │
│   Human: Decides what matters                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ Only what's relevant
┌─────────────────────────────────────────────────────────┐
│                   INSIDE CONTEXT                         │
│                                                         │
│   "Here are the top 3 items by metric X:               │
│    1. Item A │ Score: 9.5                             │
│    2. Item B │ Score: 9.3                              │
│    3. Item C │ Score: 9.0                              │
│                                                         │
│   Which would you recommend for [specific use case]?"   │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
scripts/
  fetch-top-tv.ts      # Fetches data, writes to staging
  tabulate-tv.ts       # Reads staging, outputs table

data/
  staging/             # Outside context
    tv.json
    movies.json
    whatever.json
```

## Step-by-Step

### 1. Agent Fetches to Staging

```typescript
// scripts/fetch-top-tv.ts
#!/usr/bin/env bun

import { writeFileSync, mkdirSync } from 'fs';

const API_KEY = process.env.TMDB_API_KEY;
const response = await fetch(
  `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`
);
const data = await response.json();

// Write to staging (outside context)
mkdirSync('data/staging', { recursive: true });
writeFileSync('data/staging/tv.json', JSON.stringify(data.results, null, 2));

console.log(`Fetched ${data.results.length} TV shows to data/staging/tv.json`);
```

### 2. Human Reviews Tabulated Data

```bash
# Tabulate without entering context
bun scripts/tabulate-tv.ts
```

```typescript
// scripts/tabulate-tv.ts
#!/usr/bin/env bun

import { readFileSync } from 'fs';
import { table } from 'console';

const data = JSON.parse(readFileSync('data/staging/tv.json', 'utf-8'));

// Sort by popularity and display
const sorted = data.sort((a, b) => b.popularity - a.popularity);
console.table(sorted.map(item => ({
  Rank: sorted.indexOf(item) + 1,
  Title: item.name,
  Popularity: item.popularity.toFixed(1),
  'Vote Avg': item.vote_average?.toFixed(1) || 'N/A',
  'First Air Date': item.first_air_date || 'N/A'
})));
```

### 3. Human Selects Relevant Items

```
Human: "Top 3 by popularity, I'll ask about those"

Human enters into context:
"Here are the top 3 TV shows by popularity:
1. [Show A] | Popularity: 950.2
2. [Show B] | Popularity: 890.5
3. [Show C] | Popularity: 820.1

Which would make a good case study for demonstrating our deferred loading pattern?"
```

### 4. Agent Works with Relevant Data Only

Context now contains only the 3 items, not the full 20+.

## Nushell Integration

Use Nushell to transform staged data:

```bash
# View as table
cat data/staging/tv.json | from json | table

# Sort and filter
cat data/staging/tv.json | from json | sort-by popularity | last 5 | table

# Export specific fields
cat data/staging/tv.json | from json | each {|x| {title: $x.name, score: $x.popularity}} | table
```

## Benefits

| Aspect | Traditional (dump all) | Deferred Context |
|--------|------------------------|------------------|
| Context usage | Full | Minimal |
| Human oversight | None | Full |
| Flexibility | Fixed | Adaptive |
| Cost | Higher | Lower |
| Noise | High | Low |

## When to Use

✅ **Use when:**
- Fetching lists (top 10, search results, etc.)
- Data size > few KB
- Human can meaningfully filter/sort
- Not time-critical

❌ **Don't use when:**
- Time-sensitive (need immediate answer)
- Human can't meaningfully filter (e.g., all relevant)
- Single item or tiny dataset

## Anti-Patterns

❌ **Don't:** Fetch 1000 items just to show 5
❌ **Don't:** Keep data in context that human hasn't reviewed
❌ **Don't:** Use staging as permanent storage (clean up)

## Cleanup

```bash
# Remove staging after use
rm -rf data/staging

# Or keep for audit trail
mv data/staging data/archive/2026-03-29-tv-shows
```

---

# Personal Knowledge Base

## Purpose

**Your personal data becomes the filter for everyone's data.**

Lists are always half-baked and not maintained. This pattern makes maintaining lists **low friction** and **high value** - the more you use it, the smarter it gets.

## The Problem

- "I've seen all of those" → no way to filter
- Lists get stale → no maintenance workflow
- Ratings are rare → effort vs. reward unclear

## The Solution

```
data/
  personal/
    tv.json        # {"breaking bad": {rating: 5}, "the wire": {rating: 5}, ...}
    movies.json    # Same structure
    books.json     # Same structure
  staging/
    tv.json        # Fetched from external API
```

**Easy to add. Automatic filtering. Compounding value.**

## Personal CLI

```bash
# Add something you've watched/read/used
personal add tv "Breaking Bad" --rating 5

# Quick list of your collection
personal list tv

# Check if you've seen something
personal check tv "The Wire"

# Your top picks (rated 4+)
personal top tv

# Filter external data against your list
personal filter tv data/staging/tv.json --unseen
```

## The Compounding Effect

```
Week 1:  Fetch 20 shows → 12 unseen
Week 2:  Fetch 20 shows → 8 unseen (4 added to list)
Week 3:  Fetch 20 shows → 5 unseen (3 more added)
...
Week N:  Fetch 20 shows → 2 unseen (personal list is now a great curator)
```

## The Filter Workflow

```
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL DATA                          │
│                                                         │
│   data/staging/tv.json (20 shows)                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │     personal filter tv       │
            │     --unseen                 │
            │     --minRating 4            │
            └──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  FILTERED OUTPUT                         │
│                                                         │
│   Only shows I haven't seen AND rated 4+                │
│   Much smaller list → easier to decide                   │
└─────────────────────────────────────────────────────────┘
```

## Adding Ratings

```bash
# Quick add (no rating)
personal add movies "The Matrix"

# Add with rating (1-5 stars)
personal add movies "The Matrix" --rating 5

# Add with notes
personal add movies "The Matrix" --rating 5 --notes "First time I saw bullet time"

# Later, update rating
personal add movies "The Matrix" --rating 4
# Overwrites previous entry
```

## Script Integration

```typescript
// In any fetch script, add filter option:
const { values } = parseArgs({ args: process.argv, options: { unseen: { type: 'boolean' } } });

if (values.unseen) {
  const personalData = loadData('tv');
  shows = shows.filter(show => !personalData[show.name.toLowerCase()]);
}
```

## Categories

The same pattern works for anything:

| Category | Use Case |
|----------|----------|
| `tv` | TV shows to watch |
| `movies` | Movies to see |
| `books` | Books to read |
| `podcasts` | Podcasts to try |
| `games` | Games to play |
| `recipes` | Food to cook |
| `tools` | CLI tools to learn |
| `patterns` | Code patterns to use |

## The Insight

> **Maintenance is the feature.** Low friction add → high value filter → compounding recommendations.

Traditional recommendation engines try to guess your preferences. Your personal knowledge base *knows* your preferences.

---

## Cleanup

```bash
# Staging: temporary, can be deleted after review
rm -rf data/staging

# Personal: permanent, grows more valuable over time
# Keep in version control or separate backup
```

---

**Version:** 1.0  
**Last Updated:** 2026-03-29

# Test Brief: Deferred Context Loading - Top 10 TV Shows

## Objective

Test the deferred context loading pattern by fetching popular TV shows, staging the data outside context, and selectively bringing only relevant items into context for further discussion.

## Success Criteria

1. ✅ Data fetched to `data/staging/tv.json` without polluting context
2. ✅ Data tabulated for human review
3. ✅ Human selects top 3 by their chosen metric
4. ✅ Selected items entered into context for discussion
5. ✅ Agent can make recommendation based on context-limited data

## Prerequisites

- TMDB API key set: `export TMDB_API_KEY=your_key`
- Or use mock data if API unavailable

## Implementation Steps

### Phase 1: Fetch (Agent)

```bash
# Agent runs:
bun scripts/fetch-top-tv.ts
```

Expected output:
```
Fetched 20 TV shows to data/staging/tv.json
```

### Phase 2: Review (Human)

```bash
# Agent or Human runs:
bun scripts/tabulate-tv.ts
```

Expected table:
```
┌─────┬─────────────────────┬────────────┬──────────┬──────────────────┐
│ Gen │ Title               │ Popularity │ Vote Avg │ First Air Date   │
├─────┼─────────────────────┼────────────┼──────────┼──────────────────┤
│   1 │ Show Name           │     950.2  │     9.5  │ 2008-01-20       │
│   2 │ Another Show        │     890.5  │     9.3  │ 2013-06-02       │
│   ...                                                     │
└─────┴─────────────────────┴────────────┴──────────┴──────────────────┘
```

### Phase 3: Select (Human)

Human reviews table and decides:
- "Top 3 by popularity"
- "Top 3 by vote average"
- "Most recent 3"
- etc.

Human enters selection into context:
```
Here are the top 3 TV shows by popularity:
1. Breaking Bad | Popularity: 950.2 | IMDB: 9.5
2. Game of Thrones | Popularity: 890.5 | IMDB: 9.3
3. The Sopranos | Popularity: 820.1 | IMDB: 9.2

Which would make a good case study for demonstrating the deferred context loading pattern?
```

### Phase 4: Discuss (Agent)

Agent responds based on the 3 selected items only (not full 20).

## Files to Create

```
scripts/
  fetch-top-tv.ts      # Fetch from TMDB API
  tabulate-tv.ts       # Read and display table

data/
  staging/             # Created by fetch script
    tv.json
```

## Test Variations

### Variation 1: No API Key
If TMDB API unavailable, use mock data:

```typescript
const mockData = [
  { name: "Breaking Bad", popularity: 950.2, vote_average: 9.5, first_air_date: "2008-01-20" },
  { name: "Game of Thrones", popularity: 890.5, vote_average: 9.3, first_air_date: "2011-04-17" },
  // ... 10+ items
];
```

### Variation 2: Different Data Source
- IMDB API
- Trakt.tv
- JustWatch
- Custom JSON

### Variation 3: Different Category
- Top 10 Movies
- Top 10 Songs
- Top 10 Books
- Top 10 Podcasts

## Verification Checklist

- [ ] Script fetches data successfully
- [ ] Data written to staging (not to stdout/context)
- [ ] Table displays all items with sortable columns
- [ ] Human can mentally process the table
- [ ] Human makes deliberate selection
- [ ] Context contains only selected items
- [ ] Agent responds to only the selected items

## Expected Behavior

**Good:**
- Table is scannable (10-20 items max)
- Human can sort/filter mentally
- Selection is deliberate
- Context is lean

**Bad:**
- Table too large to scan
- Agent peeked at staging before human review
- Context contains full dataset

## Notes

- This is a **proof of concept** - the pattern matters more than the specific data
- Real-world use: research summaries, code analysis results, search results
- Cleanup: `rm -rf data/staging` after discussion

---

**Status:** Ready to test

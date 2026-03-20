# Brief: Create Conceptual Lexicon Tool

**Objective**: Build a Mastra tool that enables agents to read, query, and extend the `conceptual-lexicon.json` file—establishing shared vocabulary across agents.

## Problem Statement

The repo contains `conceptual-lexicon.json` but no agent can access it. This violates **OPM-8 (Conceptual Lexicon Management)**:

> "The Conceptual Lexicon is a dynamic, collaboratively maintained list of specialized terms, definitions, and operational heuristics ensuring consistent understanding."

Without tool access, agents cannot:
- Look up term definitions during mentation
- Add new terms discovered during sessions
- Ensure vocabulary consistency across agent interactions

## Proposed Solution

### 1. Create the Tool

```typescript
// src/mastra/tools/conceptual-lexicon-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CL_PATH = join(process.cwd(), 'conceptual-lexicon.json');

const lexiconEntrySchema = z.object({
  term: z.string(),
  definition: z.string(),
  category: z.string().optional(),
  related: z.array(z.string()).optional(),
});

export const conceptualLexiconTool = createTool({
  id: 'conceptual-lexicon',
  description: 'Query or update the Conceptual Lexicon - the shared vocabulary for Ctx operations',
  inputSchema: z.object({
    action: z.enum(['lookup', 'list', 'add', 'search']),
    term: z.string().optional().describe('Term to lookup or add'),
    definition: z.string().optional().describe('Definition when adding'),
    category: z.string().optional().describe('Category for new term'),
    query: z.string().optional().describe('Search query for fuzzy matching'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    result: z.any(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { action, term, definition, category, query } = context;
    const lexicon = JSON.parse(readFileSync(CL_PATH, 'utf-8'));
    
    switch (action) {
      case 'lookup':
        const entry = lexicon.terms?.find((t: any) => 
          t.term.toLowerCase() === term?.toLowerCase()
        );
        return { success: !!entry, result: entry ?? null };
        
      case 'list':
        return { success: true, result: lexicon.terms ?? [] };
        
      case 'add':
        if (!term || !definition) {
          return { success: false, result: null, message: 'Term and definition required' };
        }
        lexicon.terms = lexicon.terms ?? [];
        lexicon.terms.push({ term, definition, category });
        writeFileSync(CL_PATH, JSON.stringify(lexicon, null, 2));
        return { success: true, result: { term, definition, category } };
        
      case 'search':
        const matches = lexicon.terms?.filter((t: any) =>
          t.term.toLowerCase().includes(query?.toLowerCase() ?? '') ||
          t.definition.toLowerCase().includes(query?.toLowerCase() ?? '')
        );
        return { success: true, result: matches ?? [] };
    }
  },
});
```

### 2. Attach to Edinburgh Protocol Agent

The CL tool is most aligned with the Edinburgh Protocol agent's mentation function.

### 3. Seed Initial Lexicon

Ensure `conceptual-lexicon.json` has the core Ctx terms:
- Mentation, Stuff, Things
- Mentational Humility
- Conceptual Entropy
- CNS (Compulsive Narrative Syndrome)

## Acceptance Criteria

- [ ] `conceptual-lexicon-tool.ts` created with lookup/list/add/search actions
- [ ] Tool attached to Edinburgh Protocol agent
- [ ] `conceptual-lexicon.json` seeded with core Ctx terminology
- [ ] Tests for each action type
- [ ] Documentation in AGENTS.md

## Dependencies

- Brief: Edinburgh Tools (should be equipped first)

## Estimated Points

5 (new tool with file I/O and multiple actions)

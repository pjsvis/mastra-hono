import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const CL_PATH = join(process.cwd(), 'conceptual-lexicon.json');

/**
 * Schema for a lexicon entry
 */
const lexiconEntrySchema = z.object({
  term: z.string(),
  definition: z.string(),
  category: z.string().optional(),
  related: z.array(z.string()).optional(),
});

/**
 * Schema for the full lexicon file
 */
const lexiconSchema = z.object({
  version: z.string(),
  project: z.string(),
  terms: z.record(z.string(), z.string()),
});

type Lexicon = z.infer<typeof lexiconSchema>;

/**
 * Load the conceptual lexicon from disk
 */
function loadLexicon(): Lexicon {
  if (!existsSync(CL_PATH)) {
    return {
      version: '1.0',
      project: 'mastra-hono',
      terms: {},
    };
  }
  const content = readFileSync(CL_PATH, 'utf-8');
  return JSON.parse(content) as Lexicon;
}

/**
 * Save the conceptual lexicon to disk
 */
function saveLexicon(lexicon: Lexicon): void {
  writeFileSync(CL_PATH, JSON.stringify(lexicon, null, 2));
}

/**
 * Conceptual Lexicon Tool
 *
 * Implements OPM-8 (Conceptual Lexicon Management):
 * "The Conceptual Lexicon is a dynamic, collaboratively maintained list of
 * specialized terms, definitions, and operational heuristics ensuring
 * consistent understanding."
 *
 * Actions:
 * - lookup: Find a specific term by name
 * - list: List all terms in the lexicon
 * - add: Add a new term with its definition
 * - search: Fuzzy search across terms and definitions
 */
export const conceptualLexiconTool = createTool({
  id: 'conceptual-lexicon',
  description:
    'Query or update the Conceptual Lexicon - the shared vocabulary for Ctx operations. Use to lookup terms, list all terms, add new terms, or search the lexicon.',
  inputSchema: z.object({
    action: z
      .enum(['lookup', 'list', 'add', 'search'])
      .describe('Action to perform: lookup a term, list all terms, add a new term, or search'),
    term: z
      .string()
      .optional()
      .describe('Term to lookup or add (required for lookup and add actions)'),
    definition: z.string().optional().describe('Definition for the term (required for add action)'),
    query: z
      .string()
      .optional()
      .describe('Search query for fuzzy matching across terms and definitions'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    action: z.string(),
    result: z.any().optional(),
    message: z.string().optional(),
    matchCount: z.number().optional(),
  }),
  execute: async ({ action, term, definition, query }) => {
    const lexicon = loadLexicon();

    switch (action) {
      case 'lookup': {
        if (!term) {
          return {
            success: false,
            action,
            message: 'Term parameter required for lookup action',
          };
        }

        // Case-insensitive lookup
        const termKey = Object.keys(lexicon.terms).find(
          (k) => k.toLowerCase() === term.toLowerCase()
        );

        if (termKey) {
          return {
            success: true,
            action,
            result: {
              term: termKey,
              definition: lexicon.terms[termKey],
            },
          };
        }

        return {
          success: false,
          action,
          message: `Term "${term}" not found in lexicon`,
        };
      }

      case 'list': {
        const termsList = Object.entries(lexicon.terms).map(([t, d]) => ({
          term: t,
          definition: d,
        }));

        return {
          success: true,
          action,
          result: termsList,
          matchCount: termsList.length,
          message: `Found ${termsList.length} terms in the lexicon`,
        };
      }

      case 'add': {
        if (!term || !definition) {
          return {
            success: false,
            action,
            message: 'Both term and definition are required for add action',
          };
        }

        // Check if term already exists
        const existingKey = Object.keys(lexicon.terms).find(
          (k) => k.toLowerCase() === term.toLowerCase()
        );

        if (existingKey) {
          return {
            success: false,
            action,
            message: `Term "${existingKey}" already exists. Use a different term name.`,
          };
        }

        // Add the new term
        lexicon.terms[term] = definition;

        // Increment version
        const versionParts = lexicon.version.split('.');
        const minor = Number.parseInt(versionParts[1] || '0', 10) + 1;
        lexicon.version = `${versionParts[0]}.${minor}`;

        saveLexicon(lexicon);

        return {
          success: true,
          action,
          result: { term, definition },
          message: `Added "${term}" to the Conceptual Lexicon (v${lexicon.version})`,
        };
      }

      case 'search': {
        if (!query) {
          return {
            success: false,
            action,
            message: 'Query parameter required for search action',
          };
        }

        const lowerQuery = query.toLowerCase();
        const matches = Object.entries(lexicon.terms)
          .filter(
            ([t, d]: [string, string]) =>
              t.toLowerCase().includes(lowerQuery) || d.toLowerCase().includes(lowerQuery)
          )
          .map(([t, d]: [string, string]) => ({ term: t, definition: d }));

        return {
          success: true,
          action,
          result: matches,
          matchCount: matches.length,
          message:
            matches.length > 0
              ? `Found ${matches.length} matching term(s)`
              : `No terms matching "${query}"`,
        };
      }

      default:
        return {
          success: false,
          action: action as string,
          message: `Unknown action: ${action}`,
        };
    }
  },
});

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export const webSearchTool = createTool({
  id: 'web-search',
  description:
    'Search the web for current information, news, facts, or specific topics. Returns search results with titles, URLs, and snippets.',
  inputSchema: z.object({
    query: z
      .string()
      .describe('Search query, e.g., "latest AI news", "weather in Tokyo", "React 19 features"'),
    limit: z.number().optional().describe('Maximum number of results to return (default: 5)'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })
    ),
    query: z.string(),
  }),
  execute: async (inputData) => {
    return await webSearch(inputData.query, inputData.limit || 5);
  },
});

const webSearch = async (
  query: string,
  limit: number
): Promise<{ results: SearchResult[]; query: string }> => {
  try {
    // Using DuckDuckGo HTML search (no API key required)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResearchAgent/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Search request failed with status ${response.status}`);
    }

    const html = await response.text();
    const results: SearchResult[] = [];

    // Parse DuckDuckGo results
    const resultRegex =
      /<a class="result__a" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<a class="result__snippet" href="[^"]*">([^<]*)/g;
    let match: RegExpExecArray | null;
    let count = 0;

    while (count < limit) {
      match = resultRegex.exec(html);
      if (match === null) {
        break;
      }
      const [, url, title, snippet] = match;

      // Clean up the snippet (remove HTML tags)
      const cleanSnippet = snippet.replace(/<[^>]*>/g, '').trim();

      // Clean up the URL (DuckDuckGo uses redirects)
      const cleanUrl = url
        .replace(/^https:\/\/www\.duckduckgo\.com\/l\/\?uddg=/, '')
        .replace(/&rut=.*/, '');

      results.push({
        title: title.trim(),
        url: decodeURIComponent(cleanUrl),
        snippet: cleanSnippet || 'No description available.',
      });

      count++;
    }

    if (results.length === 0) {
      return {
        results: [
          {
            title: 'No results found',
            url: '',
            snippet: 'The search returned no results. Try a different query.',
          },
        ],
        query,
      };
    }

    return { results, query };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      results: [
        {
          title: 'Search failed',
          url: '',
          snippet: error instanceof Error ? error.message : 'An error occurred while searching.',
        },
      ],
      query,
    };
  }
};

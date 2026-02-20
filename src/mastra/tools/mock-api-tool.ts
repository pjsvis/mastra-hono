import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const mockApiTool = createTool({
  id: 'mock-api-tool',
  description: 'Fetches sensitive user data from an internal API.',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user to fetch.'),
  }),
  outputSchema: z.object({
    result: z.unknown().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ userId }) => {
    if (!userId.startsWith('USR-')) {
      return {
        error: 'Validation Error: userId must strictly begin with the prefix "USR-".',
      };
    }

    return {
      result: {
        id: userId,
        name: 'Alice Agentic',
        status: 'active',
      },
    };
  },
});

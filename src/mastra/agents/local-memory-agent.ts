import { Agent } from '@mastra/core/agent';
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import { createOllama } from 'ollama-ai-provider-v2';
import { mockApiTool } from '../tools/mock-api-tool';

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
});

const model = ollama('lfm2.5-thinking');

const storage = new LibSQLStore({
  id: 'local-memory-storage',
  url: 'file:./mastra.db',
});

export const localMemoryAgent = new Agent({
  name: 'Local Memory Agent',
  id: 'local-memory-agent',
  instructions:
    'You are a specialized API agent. You must fetch user data using the mock API tool. If you encounter an error due to invalid input formats, you MUST take note of the required format in your memory and adapt your future requests to conform to these constraints.',
  model,
  tools: { mockApiTool },
  memory: new Memory({
    storage,
    options: {
      observationalMemory: {
        model,
        observation: {
          messageTokens: 500, // Reduced threshold for demonstrable learning in short sessions
        },
      },
    },
  }),
});

import { Agent } from '@mastra/core/agent';
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import { createOllama } from 'ollama-ai-provider-v2';
import { mockApiTool } from '../tools/mock-api-tool';

const ollama = createOllama({
  baseURL: 'http://ollama.localhost:1355/api',
});

export const localMemoryModel = ollama('lfm2.5-thinking');

export const localMemoryAgentConfig = {
  name: 'Local Memory Agent',
  id: 'local-memory-agent',
  instructions:
    'You are a specialized API agent. You must fetch user data using the mock API tool. If you encounter an error due to invalid input formats, you MUST take note of the required format in your memory and adapt your future requests to conform to these constraints.',
  memoryObservationTokens: 500,
} as const;

export const createLocalMemoryAgent = ({
  model = localMemoryModel,
  storage = new LibSQLStore({
    id: 'local-memory-storage',
    url: 'file:./mastra.db',
  }),
  observationTokens,
}: {
  model?: ReturnType<typeof ollama>;
  storage?: LibSQLStore;
  observationTokens?: number;
} = {}): Agent =>
  new Agent({
    name: localMemoryAgentConfig.name,
    id: localMemoryAgentConfig.id,
    instructions: localMemoryAgentConfig.instructions,
    model,
    tools: { mockApiTool },
    memory: new Memory({
      storage,
      options: {
        observationalMemory: {
          model,
          observation: {
            messageTokens: observationTokens ?? localMemoryAgentConfig.memoryObservationTokens,
          },
        },
      },
    }),
  });

export const localMemoryAgent = createLocalMemoryAgent();

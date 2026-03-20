import { Agent } from '@mastra/core/agent';
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import { createOllama } from 'ollama-ai-provider-v2';
import { models } from '../../lib/models';
import { mockApiTool } from '../tools/mock-api-tool';

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api',
});

/** Default model for local memory agent - uses a smaller, faster model */
export const localMemoryModel = ollama(process.env.OLLAMA_MEMORY_MODEL ?? 'qwen3.5:latest');

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

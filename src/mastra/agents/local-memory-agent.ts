import { Agent } from '@mastra/core/agent';
import { createOllama } from 'ollama-ai-provider-v2';
import { mockApiTool } from '../tools/mock-api-tool';

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
});

export const localMemoryAgent = new Agent({
  name: 'Local Memory Agent',
  id: 'local-memory-agent',
  instructions:
    'You are a specialized API agent. You must fetch user data using the mock API tool. If you encounter an error due to invalid input formats, adapt your future requests to conform to the constraints.',
  model: ollama('lfm2.5-thinking'),
  tools: { mockApiTool },
});

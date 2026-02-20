import { Agent } from '@mastra/core/agent';
import { mockApiTool } from '../tools/mock-api-tool';

export const localMemoryAgent = new Agent({
  name: 'Local Memory Agent',
  id: 'local-memory-agent',
  instructions:
    'You are a specialized API agent. You must fetch user data using the mock API tool. If you encounter an error due to invalid input formats, adapt your future requests to conform to the constraints.',
  // Fall back to a cloud model if Ollama is not configured in the test environment
  model: process.env.CI ? 'openai/gpt-4o-mini' : 'ollama/lfm2.5-thinking',
  tools: { mockApiTool },
});

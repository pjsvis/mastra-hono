import { Agent } from '@mastra/core/agent';
import { createOllama } from 'ollama-ai-provider-v2';

const ollama = createOllama({
  baseURL: 'http://ollama.localhost:1355/api',
});

const agent = new Agent({
  id: 'test-agent',
  name: 'Test Agent',
  model: ollama('lfm2.5-thinking'),
  instructions: 'test',
});

console.log('Original model:', agent.model);
// Check if we can change it
(agent as unknown as { model: string }).model = 'groq/llama-3.3-70b-versatile';

try {
  console.log('Generating with updated model...');
  const result = await agent.generate('hello');
  console.log('Success:', result.text);
} catch (error) {
  console.log(
    'Failed to generate with string model:',
    error instanceof Error ? error.message : String(error)
  );
}
// Check if we can get a new one
console.log('Methods:', Object.keys(agent));
console.log('Prototype Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(agent)));

# Mastra Core (`src/mastra/`)

This module contains the core Mastra configuration: agents, tools, and workflows.

## Agents (`agents/`)

| Agent | ID | Model | Purpose |
|-------|-----|-------|---------|
| [Research Agent](agents/research-agent.ts) | `researchAgent` | Ollama `lfm2.5-thinking` | Web search and calculations |
| [Weather Agent](agents/weather-agent.ts) | `weatherAgent` | Groq Llama 3.3 | Weather queries and activity planning |
| [Local Memory Agent](agents/local-memory-agent.ts) | `localMemoryAgent` | Ollama `lfm2.5-thinking` | Observational memory learning |
| [Edinburgh Protocol Agent](agents/edinburgh-protocol-agent.ts) | `edinburghProtocolAgent` | Ollama `lfm2.5-thinking` | Scottish Enlightenment reasoning |

### Adding a New Agent

```typescript
// src/mastra/agents/my-agent.ts
import { Agent } from '@mastra/core/agent';
import { createOllama } from 'ollama-ai-provider-v2';

const ollama = createOllama({
  baseURL: 'http://ollama.localhost:1355/api',
});

export const myAgent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  instructions: 'Your agent instructions here...',
  model: ollama('model-name'),
});
```

Then register in [`index.ts`](index.ts):

```typescript
export const mastra = new Mastra({
  agents: { myAgent, /* existing agents */ },
});
```

## Tools (`tools/`)

| Tool | ID | Description |
|------|-----|-------------|
| [Calculator](tools/calculator-tool.ts) | `calculator` | Math expressions (+, -, *, /, ^, sqrt) |
| [Web Search](tools/web-search-tool.ts) | `web-search` | DuckDuckGo HTML search (no API key) |
| [Weather](tools/weather-tool.ts) | `weather` | Open-Meteo API integration |
| [Mock API](tools/mock-api-tool.ts) | `mock-api` | API testing with user data |
| [Entropy](tools/entropy-tool.ts) | `classify-entropy` | Entropy scoring for Edinburgh Protocol |

### Adding a New Tool

```typescript
// src/mastra/tools/my-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const myTool = createTool({
  id: 'my-tool',
  description: 'What the tool does',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  async execute({ inputData }) {
    // Tool logic here
    return { result: 'output' };
  },
});
```

## Workflows (`workflows/`)

| Workflow | ID | Description |
|----------|-----|-------------|
| [Weather Workflow](workflows/weather-workflow.ts) | `weather-workflow` | Fetches weather → generates activity suggestions |

### Workflow Structure

```typescript
const myWorkflow = createWorkflow({
  id: 'my-workflow',
  inputSchema: z.object({ /* inputs */ }),
  outputSchema: z.object({ /* outputs */ }),
})
  .then(stepOne)
  .then(stepTwo);
```

## Configuration (`index.ts`)

The main Mastra instance configures:

- **Storage**: LibSQL (`mastra.db`) for persistence
- **Memory**: Default memory instance for agents
- **Observability**: Traces exported to Mastra Studio and Cloud
- **Secrets**: Loaded from Skate at runtime

## Development

Agents use **Ollama** at `http://ollama.localhost:1355/api` (via portless).

To add a new LLM provider:

```typescript
import { createOllama } from 'ollama-ai-provider-v2';
// or
import { createOpenAI } from 'openai';
```

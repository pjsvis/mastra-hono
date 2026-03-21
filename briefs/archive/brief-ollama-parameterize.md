# Brief: Parameterize Ollama Model Configuration

**Objective**: Remove hardcoded Ollama model references and make them configurable via environment variables for deployment flexibility.

## Problem Statement

Currently, agents hardcode the Ollama model:

```typescript
model: ollama('lfm2.5-thinking')
```

This creates friction when:
- The model isn't available on a new machine
- Testing with different models (e.g., `llama3.2`, `qwen2.5`)
- Switching between thinking/non-thinking variants
- CI/CD environments with different model availability

## Proposed Solution

### 1. Create Model Configuration Module

```typescript
// src/lib/models.ts
import { createOllama } from 'ollama-ai-provider-v2';

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api',
});

export const models = {
  thinking: ollama(process.env.OLLAMA_THINKING_MODEL ?? 'lfm2.5-thinking'),
  fast: ollama(process.env.OLLAMA_FAST_MODEL ?? 'llama3.2'),
  embedding: ollama(process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text'),
} as const;

export type ModelType = keyof typeof models;
```

### 2. Update Agents to Use Centralized Config

```typescript
// src/mastra/agents/research-agent.ts
import { models } from '../../lib/models';

export const researchAgent = new Agent({
  // ...
  model: models.thinking,
});
```

### 3. Update .env.example

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434/api
OLLAMA_THINKING_MODEL=lfm2.5-thinking
OLLAMA_FAST_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

## Acceptance Criteria

- [ ] `src/lib/models.ts` created with centralized model config
- [ ] All agents updated to import from `models.ts`
- [ ] `.env.example` updated with model environment variables
- [ ] Default values ensure backward compatibility
- [ ] Documentation updated in README.md

## Dependencies

None.

## Estimated Points

2 (refactoring, no new functionality)

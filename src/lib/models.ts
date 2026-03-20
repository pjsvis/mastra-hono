import { createOllama } from 'ollama-ai-provider-v2';

/**
 * Centralized Ollama model configuration.
 *
 * All models are configurable via environment variables with sensible defaults.
 * This ensures deployment flexibility across different environments.
 */

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api',
});

/**
 * Available model configurations.
 *
 * - thinking: For complex reasoning tasks (default: lfm2.5-thinking)
 * - fast: For quick responses (default: llama3.2)
 * - embedding: For vector embeddings (default: nomic-embed-text)
 */
export const models = {
  /** Complex reasoning model with extended thinking capabilities */
  thinking: ollama(process.env.OLLAMA_THINKING_MODEL ?? 'lfm2.5-thinking'),

  /** Fast response model for simple queries */
  fast: ollama(process.env.OLLAMA_FAST_MODEL ?? 'llama3.2'),

  /** Embedding model for vector operations */
  embedding: ollama(process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text'),
} as const;

export type ModelType = keyof typeof models;

/**
 * Get a specific model by type.
 * Useful when model selection needs to be dynamic.
 */
export function getModel(type: ModelType) {
  return models[type];
}
